import { Request, Response } from 'express';
import AuthModel from '../models/AuthModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await AuthModel.create({
      email,
      password: hashedPassword,
      ...rest
    });

    const token = jwt.sign({ email: newUser.email, id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });

    res.status(200).json({ result: newUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await AuthModel.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};