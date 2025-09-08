import express from "express";
import { Express } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
interface onlineUsersProps {
  userId: string;
}
const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://localjost:5173"],
  },
});

const onlineUsers: Record<string, string> = {};
export const resolveUserSocketId = (userId: string) => {
  return onlineUsers[userId];
};
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId as string;
  onlineUsers[userId] = socket.id;
  io.emit("getOnlineUser", Object.keys(onlineUsers));
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete onlineUsers[userId];
    io.emit("getOnlineUser", Object.keys(onlineUsers));
  });
});

export { io, server, app };
