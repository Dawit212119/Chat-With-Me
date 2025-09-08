import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/db";
import authRoute from "./routes/auth.rout.js";
import authMessages from "./routes/message.rout.js";
import { Types } from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket";
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: Types.ObjectId;
        fullname: string;
        userPic: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
      };
    }
  }
}
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("welcome to home page");
});
app.use("/api/auth", authRoute);
app.use("/api/messages", authMessages);
server.listen(process.env.PORT, () => {
  console.log("server start at port", process.env.PORT);
  connectDb();
});
