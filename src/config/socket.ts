import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import prisma from "./db.js";

//create a variable to hold 'io'so we can use it anywhere
let io: Server;

// Presence tracking. Held in-memory: this loses state on restart, which is
// fine for "who's online right now" — sockets reconnect and re-emit.
//
// presenceByProject: projectId -> Map<userId, { name, sockets: Set<socketId>}>
// We key by userId so a single user with two tabs counts once.
type PresenceUser = {
  userId: string;
  name?: string;
  sockets: Set<string>;
};
const presenceByProject = new Map<string, Map<string, PresenceUser>>();

// taskViewers: projectId -> taskId -> Set<userId>
const taskViewers = new Map<string, Map<string, Set<string>>>();

// Per-socket bookkeeping so we can clean up on disconnect without scanning.
type SocketState = { projectIds: Set<string>; viewingTaskByProject: Map<string, string> };
const socketState = new Map<string, SocketState>();

function getOrCreateProjectPresence(projectId: string) {
  let m = presenceByProject.get(projectId);
  if (!m) {
    m = new Map();
    presenceByProject.set(projectId, m);
  }
  return m;
}

function projectRoster(projectId: string) {
  const m = presenceByProject.get(projectId);
  if (!m) return [];
  return Array.from(m.values()).map(({ userId, name }) => ({ userId, name }));
}

function getOrCreateTaskMap(projectId: string) {
  let m = taskViewers.get(projectId);
  if (!m) {
    m = new Map();
    taskViewers.set(projectId, m);
  }
  return m;
}

function detachFromProject(
  socket: import("socket.io").Socket,
  userId: string,
  projectId: string,
) {
  const state = socketState.get(socket.id);
  if (state) state.projectIds.delete(projectId);

  // Drop any task-viewer presence held by this socket for this project.
  const viewingTaskId = state?.viewingTaskByProject.get(projectId);
  if (viewingTaskId) {
    const taskMap = taskViewers.get(projectId);
    const viewers = taskMap?.get(viewingTaskId);
    if (viewers) {
      viewers.delete(userId);
      if (viewers.size === 0) taskMap?.delete(viewingTaskId);
      socket
        .to(projectId)
        .emit("task:viewer_left", {
          projectId,
          taskId: viewingTaskId,
          userId,
        });
    }
    state?.viewingTaskByProject.delete(projectId);
  }

  // Drop project-room presence (only when last tab leaves).
  const projectMap = presenceByProject.get(projectId);
  const presenceUser = projectMap?.get(userId);
  if (presenceUser) {
    presenceUser.sockets.delete(socket.id);
    if (presenceUser.sockets.size === 0) {
      projectMap?.delete(userId);
      socket.to(projectId).emit("presence:leave", { projectId, userId });
    }
  }

  socket.leave(projectId);
}

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    // Prefer the auth payload (kept out of URLs/logs). Fall back to query/header
    // for legacy clients during rollout.
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.query.token ||
      socket.handshake.headers.token;

    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const user = jwt.verify(token, env.JWT_SECRET!);
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).data.user.id;
    const userName = (socket as any).data.user.name;
    socket.join(userId);
    socketState.set(socket.id, {
      projectIds: new Set(),
      viewingTaskByProject: new Map(),
    });
    console.log(`📡 User ${userId} joined personal room`);

    socket.on("join_project", async (projectId: string) => {
      if (!projectId) return;

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: { userId, projectId },
        },
      });

      if (!membership) {
        console.warn(
          `Unauthorized join attempt by user ${userId} for project ${projectId}`,
        );
        return socket.emit("error", {
          message: "You are not a member of this project",
        });
      }

      socket.join(projectId);
      const state = socketState.get(socket.id);
      state?.projectIds.add(projectId);

      // Track presence — dedupe by userId so multiple tabs from the same user
      // collapse into one chip.
      const projectMap = getOrCreateProjectPresence(projectId);
      let existing = projectMap.get(userId);
      const wasAlreadyPresent = !!existing;
      if (!existing) {
        existing = { userId, name: userName, sockets: new Set() };
        projectMap.set(userId, existing);
      }
      existing.sockets.add(socket.id);

      // Tell the joining socket the full current roster.
      socket.emit("presence:state", { projectId, users: projectRoster(projectId) });

      // Notify everyone else only when this is the first tab for this user.
      if (!wasAlreadyPresent) {
        socket
          .to(projectId)
          .emit("presence:join", { projectId, user: { userId, name: userName } });
      }

      console.log(`✅ User ${userId} safely joined room: ${projectId}`);
    });

    socket.on("leave_project", (projectId: string) => {
      if (!projectId) return;
      detachFromProject(socket, userId, projectId);
    });

    socket.on(
      "task:viewing",
      ({ projectId, taskId }: { projectId: string; taskId: string | null }) => {
        if (!projectId) return;
        const state = socketState.get(socket.id);
        if (!state) return;
        const previousTask = state.viewingTaskByProject.get(projectId);
        if (previousTask === (taskId ?? undefined)) return;

        const taskMap = getOrCreateTaskMap(projectId);

        // Leave the previous task, if any.
        if (previousTask) {
          const viewers = taskMap.get(previousTask);
          if (viewers) {
            viewers.delete(userId);
            if (viewers.size === 0) taskMap.delete(previousTask);
            socket
              .to(projectId)
              .emit("task:viewer_left", {
                projectId,
                taskId: previousTask,
                userId,
              });
          }
        }

        // Join the new task.
        if (taskId) {
          state.viewingTaskByProject.set(projectId, taskId);
          let viewers = taskMap.get(taskId);
          if (!viewers) {
            viewers = new Set();
            taskMap.set(taskId, viewers);
          }
          const firstViewer = !viewers.has(userId);
          viewers.add(userId);
          if (firstViewer) {
            socket
              .to(projectId)
              .emit("task:viewer_joined", {
                projectId,
                taskId,
                user: { userId, name: userName },
              });
          }
        } else {
          state.viewingTaskByProject.delete(projectId);
        }
      },
    );

    socket.on("disconnect", (reason) => {
      const state = socketState.get(socket.id);
      if (state) {
        for (const projectId of state.projectIds) {
          detachFromProject(socket, userId, projectId);
        }
        socketState.delete(socket.id);
      }
      console.log("User disconnected reason:", reason);
    });
  });

  return io;
};
// This function lets us "get" the io instance in our controllers
export const getIO = () => {
  if (!io) {
    throw new Error("Socker.io not initialized");
  }
  return io;
};
