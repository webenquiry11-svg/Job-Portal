import { Request, Response } from 'express';
import JobModel from '../models/jobmodel';

export const createJob = async (req: Request, res: Response) => {
  try {
    const newJob = new JobModel(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error: any) {
    console.error("Error creating job:", error);
    res.status(409).json({ message: error.message || "Failed to create job" });
  }
};

export const getJobsByEmployer = async (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;
    const jobs = await JobModel.find({ employerId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(404).json({ message: error.message || "Failed to fetch jobs" });
  }
};