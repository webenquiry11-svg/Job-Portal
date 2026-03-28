import express from 'express';
import { createJob, getJobsByEmployer, getAllJobs, deleteJob, applyForJob, updateApplicantStatus } from '../controllers/jobController';

const router = express.Router();

router.get('/all', getAllJobs);
router.post('/create', createJob);
router.get('/employer/:employerId', getJobsByEmployer);
router.post('/apply', applyForJob);
router.patch('/applicant-status', updateApplicantStatus);
router.delete('/:id', deleteJob);

export default router;