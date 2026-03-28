import { Request, Response } from 'express';
import Chat from '../models/ChatModel';
import AuthModel from '../models/AuthModel';
import NotificationModel from '../models/NotificationModel';

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
    
    // Create Notification for the Recipient
    try {
      const sender = await AuthModel.findById(senderId);
      if (sender) {
        const senderName = sender.companyName || sender.name || 'Someone';
        await NotificationModel.create({
          userId: receiverId,
          message: `You have a new message from ${senderName}.`
        });
      }
    } catch (err) {
      console.error('Failed to create message notification:', err);
    }

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error });
  }
};

export const markAsSeen = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.body;
    // Mark all messages from senderId to receiverId as seen
    await Chat.updateMany(
      { senderId, receiverId, seen: false },
      { $set: { seen: true } }
    );
    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark messages as seen', error });
  }
};

export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const unreadSenders = await Chat.distinct('senderId', { receiverId: userId, seen: false });
    res.status(200).json({ count: unreadSenders.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unread count', error });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const messages = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map();
    for (const msg of messages) {
      const senderIdStr = msg.senderId.toString();
      const receiverIdStr = msg.receiverId.toString();
      
      const otherUserIdStr = senderIdStr === userId ? receiverIdStr : senderIdStr;
      
      if (!conversationsMap.has(otherUserIdStr)) {
        // Fetch user manually to completely bypass Mongoose populate/ref mismatches
        const otherUser = await AuthModel.findById(otherUserIdStr).select('name companyName profilePicture headline industry role');
        if (otherUser) {
          conversationsMap.set(otherUserIdStr, otherUser);
        } else {
          conversationsMap.set(otherUserIdStr, { _id: otherUserIdStr, name: 'User', headline: 'Job Portal User' });
        }
      }
    }

    res.status(200).json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', error });
  }
};