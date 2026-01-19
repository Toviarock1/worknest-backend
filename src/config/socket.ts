import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "./env";

//create a variable to hold 'io'so we can use it anywhere
let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;

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
    console.log("A user connected to WorkNest:", socket.id);

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
