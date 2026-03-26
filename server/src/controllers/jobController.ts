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

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    // Fetch all active jobs and populate the employer details to show the company name
    const jobs = await JobModel.find({ status: 'Active' }).populate('employerId', 'companyName name').sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching all jobs:", error);
    res.status(500).json({ message: error.message || "Failed to fetch jobs" });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // In a real app, you'd also want to verify that the user deleting the job is the owner.
    // This would typically be done via middleware that adds the user's ID to the request.
    // For example: if (job.employerId.toString() !== req.userId) return res.status(403).json(...);

    const job = await JobModel.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: error.message || "Failed to delete job" });
  }
};