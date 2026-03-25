import express from 'express';
import { createJob, getJobsByEmployer, getAllJobs } from '../controllers/jobController';

const router = express.Router();

router.get('/all', getAllJobs);
router.post('/create', createJob);
router.get('/employer/:employerId', getJobsByEmployer);

export default router;