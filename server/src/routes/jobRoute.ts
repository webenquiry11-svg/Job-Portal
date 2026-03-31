import express from 'express';
import {
  createJob,
  getJobsByEmployer,
  getAllJobs,
  applyForJob,
  updateApplicantStatus,
  scheduleInterview,
  deleteJob
} from '../controllers/jobController';

const router = express.Router();

// All routes are prefixed with /jobs

router.post('/create', createJob);
router.get('/employer/:employerId', getJobsByEmployer);
router.get('/all', getAllJobs);
router.post('/apply', applyForJob);

// This is the route that is currently missing
router.put('/status', updateApplicantStatus);

router.post('/schedule-interview', scheduleInterview);
router.delete('/:id', deleteJob);

export default router;