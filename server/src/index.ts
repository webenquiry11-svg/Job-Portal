import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/AuthRoute';
import jobRoutes from './routes/jobRoute';
import companyRoutes from './routes/CompanyRoute';
import chatRoute from './routes/ChatRoute';
import jobAlertRoutes from './routes/JobAlertRoute';
import { startCronJobs } from './utils/cronJobs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import jwt from 'jsonwebtoken';
import AuthModel from './models/AuthModel';
import { sendWelcomeEmail } from './utils/mailer';
import https from 'https';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Trust proxy is required for Passport OAuth to work correctly behind cloud providers (Render, Heroku, etc.)
app.set('trust proxy', 1);

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

// Passport Configuration
app.use(passport.initialize());

const JWT_SECRET = process.env.JWT_SECRET || 'test';

const BASE_URL = process.env.API_URL ? process.env.API_URL.replace(/\/$/, '') : 'http://localhost:5000';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: `${BASE_URL}/auth/google/callback`,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      let user = await AuthModel.findOne({ email });
      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        console.log("👉 Creating new Google OAuth user...");
        user = await AuthModel.create({
          name: profile.displayName,
          email: email,
          role: 'seeker',
          googleId: profile.id,
          isEmailVerified: true,
          profilePicture: profile.photos?.[0]?.value
        });
      } else if (!user.googleId) {
        console.log("👉 Linking Google account to existing user...");
        await AuthModel.findByIdAndUpdate(user._id, { googleId: profile.id });
      }
      if (!user) {
        return done(new Error("User authentication failed."), false);
      }
      if (isNewUser) {
        try { await sendWelcomeEmail(user.email, user.name, user.role); } catch (err) { console.error('Failed to send welcome email:', err); }
      }
      const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return done(null, { user: user.toObject ? user.toObject() : user, token });
    } catch (error) {
      return done(error, false);
    }
  }
));

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: `${BASE_URL}/auth/microsoft/callback`,
    scope: ['user.read', 'email'],
    proxy: true
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const email = profile.emails?.[0]?.value || profile._json?.userPrincipalName;
      let user = await AuthModel.findOne({ email });
      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        console.log("👉 Creating new Microsoft OAuth user...");
        user = await AuthModel.create({
          name: profile.displayName,
          email: email,
          role: 'seeker',
          microsoftId: profile.id,
          isEmailVerified: true
        });
      } else if (!user.microsoftId) {
        console.log("👉 Linking Microsoft account to existing user...");
        await AuthModel.findByIdAndUpdate(user._id, { microsoftId: profile.id });
      }
      if (!user) {
        return done(new Error("User authentication failed."), false);
      }
      if (isNewUser) {
        try { await sendWelcomeEmail(user.email, user.name, user.role); } catch (err) { console.error('Failed to send welcome email:', err); }
      }
      const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return done(null, { user: user.toObject ? user.toObject() : user, token });
    } catch (error) {
      return done(error, false);
    }
  }
));

// Google One Tap Login Endpoint
app.post('/auth/google/onetap', (req: Request, res: Response): any => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }

    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, (googleRes) => {
      let data = '';
      googleRes.on('data', (chunk) => data += chunk);
      googleRes.on('end', async () => {
        try {
          const profile = JSON.parse(data);
          if (profile.error || !profile.email) {
            return res.status(400).json({ message: 'Invalid Google token' });
          }

          const email = profile.email;
          let user = await AuthModel.findOne({ email });
          let isNewUser = false;
          
          if (!user) {
            isNewUser = true;
            console.log("👉 Creating new Google One Tap user...");
            user = await AuthModel.create({
              name: profile.name,
              email: email,
              role: 'seeker',
              googleId: profile.sub,
              isEmailVerified: true,
              profilePicture: profile.picture
            });
          } else if (!user.googleId) {
            console.log("👉 Linking Google account to existing user...");
            await AuthModel.findByIdAndUpdate(user._id, { googleId: profile.sub });
          }

          if (isNewUser) {
            try { await sendWelcomeEmail(user.email, user.name, user.role); } catch (err) { console.error('Failed to send welcome email:', err); }
          }

          const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
          return res.status(200).json({ result: user, token });
        } catch (parseError) {
          return res.status(500).json({ message: 'Error parsing Google response' });
        }
      });
    }).on('error', (err) => {
      return res.status(500).json({ message: 'Failed to verify token with Google' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during One Tap login' });
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/company', companyRoutes);
app.use('/chat', chatRoute);
app.use('/alerts', jobAlertRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: "🚀 Click4Jobs API is Live",
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

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log("❌ WARNING: GOOGLE_CLIENT_ID or SECRET is MISSING! Google Login will fail.");
} else {
  console.log("✅ Google OAuth credentials found.");
}

if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
  console.log("❌ WARNING: MICROSOFT_CLIENT_ID or SECRET is MISSING! Microsoft Login will fail.");
} else {
  console.log("✅ Microsoft OAuth credentials found.");
}

mongoose.connect(CONNECTION_URL)
  .then(() => {
    startCronJobs(); // Initialize the Daily Job Alert worker
    app.listen(PORT, () => {
    console.log(`
    ===========================================
    ✅ Server running on: http://localhost:${PORT}
    🗄️  Database Connected (MongoDB)
    🛠️  Mode: Development
    ===========================================
    `);
    });
  })
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