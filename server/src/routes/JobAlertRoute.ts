import express from 'express';
import { createAlert, getUserAlerts, deleteAlert } from '../controllers/JobAlertController';

const router = express.Router();

router.post('/', createAlert);
router.get('/:userId', getUserAlerts);
router.delete('/:id', deleteAlert);

export default router;