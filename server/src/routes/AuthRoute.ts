import express from 'express';
import { register, login, updateProfile } from '../controllers/AuthController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/update', updateProfile);

export default router;