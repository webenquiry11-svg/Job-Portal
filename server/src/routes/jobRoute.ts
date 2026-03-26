import express from 'express';
import { createJob, getJobsByEmployer, getAllJobs, deleteJob } from '../controllers/jobController';

const router = express.Router();

router.get('/all', getAllJobs);
router.post('/create', createJob);
router.get('/employer/:employerId', getJobsByEmployer);
router.delete('/:id', deleteJob);

export default router;