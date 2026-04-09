import { Request, Response } from 'express';
import JobAlertModel from '../models/JobAlertModel';

export const createAlert = async (req: Request, res: Response) => {
  try {
    const { userId, keyword, location } = req.body;
    const newAlert = new JobAlertModel({ userId, keyword, location });
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job alert', error });
  }
};

export const getUserAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await JobAlertModel.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job alerts', error });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    await JobAlertModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job alert', error });
  }
};