import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("⚠️ CRITICAL ERROR: Cloudinary credentials are missing in your backend .env file!");
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'job_portal_profiles',
  } as any,
});

const upload = multer({ storage });

export default upload;