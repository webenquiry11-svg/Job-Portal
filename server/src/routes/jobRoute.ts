import express from 'express';
import { createJob, getJobsByEmployer } from '../controllers/jobController';

const router = express.Router();

router.post('/create', createJob);
router.get('/employer/:employerId', getJobsByEmployer);

export default router;