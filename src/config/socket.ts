import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import prisma from "./db.js";

//create a variable to hold 'io'so we can use it anywhere
let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const rawToken =
      socket.handshake.query.token || socket.handshake.headers.token;

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
    socket.join(userId);
    console.log(`📡 User ${userId} joined personal room`);

    socket.on("join_project", async (projectId: string) => {
      if (!projectId) return;

      const userId = socket.data.user.id;
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
      console.log(`✅ User ${userId} safely joined room: ${projectId}`);
    });

    socket.on("disconnect", (reason) => {
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
