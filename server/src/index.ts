import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // High-quality security headers
app.use(cors());   // Allows your frontend to talk to this server
app.use(express.json()); // Allows the server to read JSON data

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: "🚀 Job Portal API is Live",
    status: "Premium",
    version: "1.0.0"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ===========================================
  ✅ Server running on: http://localhost:${PORT}
  🛠️  Mode: Development
  ===========================================
  `);
});