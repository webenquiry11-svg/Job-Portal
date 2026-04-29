import { Request, Response } from 'express';
import JobModel from '../models/jobmodel';
import AuthModel from '../models/AuthModel';
import NotificationModel from '../models/NotificationModel';

export const createJob = async (req: Request, res: Response) => {
  try {
    const employer = await AuthModel.findById(req.body.employerId);
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    // Failsafe: Wipe credits if trial expired
    if (employer.trialStartedAt && ((Date.now() - new Date(employer.trialStartedAt).getTime()) / (1000 * 60 * 60 * 24)) > 15 && (employer.credits || 0) > 0) {
      employer.credits = 0; 
    }
    if ((employer.credits || 0) < 5) {
      return res.status(403).json({ message: "Insufficient credits to post a job. Please upgrade your plan." });
    }
    employer.credits = (employer.credits || 0) - 5;
    await employer.save();

    const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 Days Validity Independent Clock
    const newJob = new JobModel({ ...req.body, expiresAt });
    await newJob.save();

    // Notify followers
    try {
      const employer = await AuthModel.findById(newJob.employerId);
      if (employer) {
        const followers = await AuthModel.find({ followingCompanies: newJob.employerId });
        const notifications = followers.map(follower => ({
          userId: follower._id,
          message: `${employer.companyName || employer.name || 'A company'} posted a new job: ${newJob.title}`
        }));
        if (notifications.length > 0) {
          await NotificationModel.insertMany(notifications);
        }
      }
    } catch (notifErr) {
      console.error("Failed to send job notifications:", notifErr);
    }

    res.status(201).json(newJob);
  } catch (error: any) {
    console.error("❌ Error creating job:", error.message, error.errors || error);
    res.status(500).json({ message: error.message || "Failed to create job", details: error.errors });
  }
};

export const getJobsByEmployer = async (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;
    const jobs = await JobModel.find({ employerId }).populate('applicants').sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: error.message || "Failed to fetch jobs" });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    // Fetch all active jobs and populate the employer details to show the company name
    const jobs = await JobModel.find({ status: 'Active' }).populate('employerId', 'companyName name gstVerificationStatus').sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching all jobs:", error);
    res.status(500).json({ message: error.message || "Failed to fetch jobs" });
  }
};

export const applyForJob = async (req: Request, res: Response) => {
  const { jobId, candidateId } = req.body;
  try {
    const job = await JobModel.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const candidate = await AuthModel.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // Check if already applied
    if (job.applicants && job.applicants.includes(candidateId as any)) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add to applicants array
    if (!job.applicants) {
      job.applicants = [];
    }
    job.applicants.push(candidateId as any);

    // Add to applicantDetails with 'Applied' status
    if (!job.applicantDetails) {
      job.applicantDetails = [];
    }
    // Ensure no duplicate detail entry
    if (!job.applicantDetails.some(d => d.candidateId.toString() === candidateId)) {
      job.applicantDetails.push({ candidateId: candidateId as any, status: 'Applied', appliedAt: new Date() });
    }

    await job.save();

    // Create notification for employer
    await NotificationModel.create({
      userId: job.employerId,
      message: `${candidate.name} has applied for your job: ${job.title}.`,
    });

    res.status(200).json({ message: 'Applied successfully' });
  } catch (error: any) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const updateApplicantStatus = async (req: Request, res: Response) => {
  const { jobId, candidateId, status } = req.body;
  try {
    const job = await JobModel.findById(jobId);
    const candidate = await AuthModel.findById(candidateId);
    if (!job || !candidate) return res.status(404).json({ message: 'Not found' });

    let detail = job.applicantDetails?.find((d: any) => d.candidateId.toString() === candidateId);
    if (!detail) {
      if (!job.applicantDetails) job.applicantDetails = [];
      job.applicantDetails.push({ candidateId: candidateId as any, status, appliedAt: new Date() });
    } else {
      detail.status = status;
    }
    await job.save();

    // Create notification for the candidate
    let notificationMessage = `Your application for "${job.title}" has been moved to: ${status}.`;
    if (status === 'Selected') {
      notificationMessage = `Congratulations! Your application for "${job.title}" has been selected for this role.`;
    } else if (status === 'Interview') {
      notificationMessage = `Your application for "${job.title}" has been moved to the interview section. Your interview date and details will be notified to you soon.`;
    }

    await NotificationModel.create({
      userId: candidateId,
      message: notificationMessage,
    });

    res.status(200).json({ message: 'Candidate notified successfully' });
  } catch (error: any) {
    console.error('Update applicant status error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const scheduleInterview = async (req: Request, res: Response) => {
  const { jobId, candidateId, interviewDate, link, description } = req.body;
  try {
    const job = await JobModel.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    let detail = job.applicantDetails?.find((d: any) => d.candidateId.toString() === candidateId);
    if (!detail) {
      if (!job.applicantDetails) job.applicantDetails = [];
      const newDetail = { candidateId: candidateId as any, status: 'Interview', appliedAt: new Date() };
      job.applicantDetails.push(newDetail);
      detail = job.applicantDetails[job.applicantDetails.length - 1];
    }

    // The server now receives a full ISO string, which new Date() parses correctly into a UTC-based Date object.
    const dateObject = new Date(interviewDate);
    detail.interviewDate = dateObject;
    detail.interviewLink = link;
    detail.interviewDescription = description;
    detail.status = 'Interview';
    await job.save();

    await NotificationModel.create({
      userId: candidateId,
      message: `Your interview for "${job.title}" has been scheduled. Please check your dashboard for the date, time, and meeting details.`,
    });

    res.status(200).json({ message: 'Interview scheduled successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
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