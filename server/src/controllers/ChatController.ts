import { Request, Response } from 'express';
import Chat from '../models/ChatModel';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Chat.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const newChat = new Chat({ senderId, receiverId, message });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error });
  }
};