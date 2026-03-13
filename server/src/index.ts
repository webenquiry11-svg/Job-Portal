import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './routes/AuthRoute';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
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
