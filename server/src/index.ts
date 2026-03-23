import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/AuthRoute';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(helmet());

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',                 // Local frontend
  'https://job-portal-ta5n.onrender.com'  // Deployed frontend
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) and from whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: "🚀 Job Portal API is Live",
    status: "Premium",
    version: "1.0.0"
  });
});

const CONNECTION_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';
const PORT = process.env.PORT || 5000;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log("❌ WARNING: Cloudinary credentials are MISSING in your server/.env file!");
} else {
  console.log("✅ Cloudinary credentials found.");
}

if (!process.env.EMAIL_APP_PASSWORD) {
  console.log("❌ WARNING: EMAIL_APP_PASSWORD is MISSING in your server/.env file! Email OTPs will fail.");
} else {
  console.log("✅ Email credentials found.");
}

mongoose.connect(CONNECTION_URL)
  .then(() => app.listen(PORT, () => {
    console.log(`
    ===========================================
    ✅ Server running on: http://localhost:${PORT}
    🗄️  Database Connected (MongoDB)
    🛠️  Mode: Development
    ===========================================
    `);
  }))
  .catch((error) => {
    console.log(`${error} did not connect`);
    if (error instanceof Error && error.message.includes('Atlas')) {
      console.log("💡 Hint: It looks like you are using MongoDB Atlas. Please check your Network Access settings in Atlas and whitelist your current IP address.");
    } else {
      console.log("💡 Hint: Make sure MongoDB is running locally on port 27017, or set a valid MONGO_URI in your .env file.");
    }
    // Exit process with failure code so the deployment platform knows it failed and can restart/log it
    process.exit(1);
  });