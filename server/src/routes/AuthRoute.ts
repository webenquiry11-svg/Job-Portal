import express from 'express';
import { register, login, updateProfile } from '../controllers/AuthController';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/update', (req, res, next) => {
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error("Cloudinary Upload Error:", err);
      return res.status(500).json({ message: "Cloudinary Upload Failed. Check your backend .env file.", error: err.message });
    }
    next();
  });
}, updateProfile);

export default router;