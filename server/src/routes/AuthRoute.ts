import express from 'express';
import { 
  register, 
  login, 
  updateProfile, 
  requestOtp, 
  verifyOtp, 
  sendAdminOtp, 
  verifyAdminOtp, 
  requestGstVerification, 
  getPendingGstVerifications, 
  updateGstVerificationStatus, 
  toggleFollowCompany, 
  getNotifications,
  markNotificationsAsRead,
  getCompanyById,
  incrementProfileView
} from '../controllers/AuthController';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// --- Fixed Update Profile Route ---
router.patch('/update', (req, res, next) => {
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 } // <--- Resume field yahan add kar di hai
  ])(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(500).json({ 
        message: "File Upload Failed. Check your backend configurations.", 
        error: err.message 
      });
    }
    next();
  });
}, updateProfile);

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/admin/send-otp', sendAdminOtp);
router.post('/admin/verify-otp', verifyAdminOtp);
router.post('/employer/request-gst-verification', requestGstVerification);
router.get('/admin/gst-verifications/pending', getPendingGstVerifications);
router.patch('/admin/gst-verifications/update-status', updateGstVerificationStatus);

// Follow/Unfollow route
router.patch('/follow/:companyId', toggleFollowCompany);

// Notification Routes
router.get('/notifications/:userId', getNotifications);
router.patch('/notifications/:userId/read', markNotificationsAsRead);

// Company/Profile View Routes
router.get('/company/:id', getCompanyById);
router.put('/profile/view/:id', incrementProfileView);

export default router;