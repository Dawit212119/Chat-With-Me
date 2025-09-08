import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Messages } from "../models/messages.model";
import cloudinary from "../lib/cloudinary";
import { io, resolveUserSocketId } from "../lib/socket";

export const getUsers = async (req: Request, res: Response) => {
  const currentUser = req.user._id;

  const fetchedUser = await User.find({ id: { $ne: currentUser } }).select(
    "-password"
  );

  res.status(200).json({
    fetchedUser,
  });
};

export const getMessages = async (req: Request, res: Response) => {
  const { id: chatTo } = req.params;
  const currentUser = req.user._id;

  const messages = Messages.find({
    $or: [
      { senderId: currentUser, receiverId: chatTo },
      { receiverId: currentUser, senderId: chatTo },
    ],
  });

  res.status(200).json({
    messages,
  });
};

export const sendMessages = async (req: Request, res: Response) => {
  const { id: sendTo } = req.params;
  const currentUser = req.user._id;
  const { text, image } = req.body;
  let imageUrl;
  if (image) {
    const uploadImage = await cloudinary.uploader.upload(image);
    imageUrl = uploadImage.secure_url;
  }
  const sendMessage = new Messages({
    senderId: currentUser,
    receiverId: sendTo,
    text,
    image: imageUrl,
  });
  await sendMessage.save();
  //  todo : realtime functionality
  const receiversocketId = resolveUserSocketId(sendTo);
  if (receiversocketId) {
    io.to(receiversocketId).emit("newMessage", sendMessage);
  }

  res.status(201).json(sendMessage);
};
