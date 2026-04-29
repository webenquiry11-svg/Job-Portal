import cron from 'node-cron';
import mongoose from 'mongoose';
import JobAlertModel from '../models/JobAlertModel';
import AuthModel from '../models/AuthModel';
import { sendJobAlertEmail } from './mailer';
import NotificationModel from '../models/NotificationModel';

export const startCronJobs = () => {
  // Runs every day at 08:00 AM server time (adjust as needed)
  cron.schedule('0 8 * * *', async () => {
    console.log('🔄 Running daily Job Alerts cron job...');
    try {
      const alerts = await JobAlertModel.find();
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const JobModel = mongoose.model('Job'); // Access Job model directly

      for (const alert of alerts) {
        const query: any = { createdAt: { $gte: twentyFourHoursAgo }, status: 'Active' };
        
        if (alert.keyword) {
          query.$or = [
            { title: { $regex: alert.keyword, $options: 'i' } },
            { skills: { $regex: alert.keyword, $options: 'i' } }
          ];
        }
        if (alert.location) {
          query.location = { $regex: alert.location, $options: 'i' };
        }

        const matchedJobs = await JobModel.find(query).populate('employerId', 'companyName name').limit(5);

        if (matchedJobs.length > 0) {
          const user = await AuthModel.findById(alert.userId);
          if (user && user.email) {
            const alertName = alert.keyword || alert.location || 'Recommended';
            
            await sendJobAlertEmail(user.email, user.name, matchedJobs, alertName);
            
            // Create In-App Push Notification for the candidate's dashboard
            await NotificationModel.create({
              userId: user._id,
              message: `Job Alert: We found ${matchedJobs.length} new jobs matching "${alertName}" in the last 24 hours!`
            });
          }
        }
      }
      console.log('✅ Daily Job Alerts processed successfully.');
    } catch (error) {
      console.error('❌ Error processing Job Alerts:', error);
    }

    // --- 15-Day Trial and Job Lifecycle Cleanup ---
    try {
      const JobModel = mongoose.model('Job');
      // Close jobs that have passed their 15-day validity
      await JobModel.updateMany(
        { status: 'Active', expiresAt: { $lte: new Date() } },
        { $set: { status: 'Closed' } }
      );
      // Wipe unused credits for employers whose 15-day trial has expired
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      await AuthModel.updateMany(
        { role: 'employer', trialStartedAt: { $lte: fifteenDaysAgo }, credits: { $gt: 0 } },
        { $set: { credits: 0 } }
      );
    } catch (cleanupErr) { console.error('❌ Error during expiration cleanup:', cleanupErr); }
  });
};