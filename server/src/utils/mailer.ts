import nodemailer from 'nodemailer';

export const sendOtpEmail = async (to: string, otp: string) => {
  // Don't try to send if credentials are not set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ Email credentials (EMAIL_USER, EMAIL_APP_PASSWORD) not found. Cannot send OTP email.');
    return; // Silently fail but log for development
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Click4Jobs" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Your Click4Jobs Verification Code',
    html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;"><h2 style="color: #0B0C10;">Verify Your Email Address</h2><p>Welcome to Click4Jobs! To complete your registration, please use the following One-Time Password (OTP):</p><p style="background: #f2f2f2; border-radius: 8px; padding: 10px 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #0B0C10;">${otp}</p><p>This code is valid for 10 minutes.</p><p>If you did not request this, you can safely ignore this email.</p><hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" /><p style="font-size: 0.9em; color: #888;">Best regards,<br>The Click4Jobs Team</p></div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${to}:`, error);
    throw new Error('Failed to send verification email. Please check server logs.');
  }
};

export const sendWelcomeEmail = async (to: string, name: string, role: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ Email credentials not found. Cannot send welcome email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const isEmployer = role === 'employer';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const dashboardLink = isEmployer ? `${clientUrl}/employer/dashboard` : `${clientUrl}/Condidate/Dashboard`;
  
  const roleMessage = isEmployer 
    ? 'Get ready to post your open roles, track applications seamlessly, and hire the best talent to build your dream team.'
    : 'Get ready to explore exciting opportunities, showcase your skills, and take the next big step in your career journey.';

  const mailOptions = {
    from: `"Click4Jobs" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `Welcome to Click4Jobs, ${name}! 🚀`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Click4Jobs</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td align="center" bgcolor="#0B0C10" style="padding: 40px 20px; border-bottom: 4px solid #e49d04;">
                  <img src="${clientUrl}/Click4Jobs%20Logo.png" alt="Click4Jobs" style="height: 240px; display: block; margin: 0 auto;" />
                  <p style="color: #a1a1aa; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Welcome to the future of hiring.</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 24px; font-weight: 800;">Hello ${name},</h2>
                  <p style="color: #52525b; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Thank you for joining Click4Jobs! We are absolutely thrilled to welcome you to our community as <strong>${isEmployer ? 'an Employer' : 'a Candidate'}</strong>.
                  </p>
                  <p style="color: #52525b; margin: 0 0 35px 0; font-size: 16px; line-height: 1.6;">
                    ${roleMessage}
                  </p>
                  <!-- CTA -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="${dashboardLink}" style="display: inline-block; background-color: #e49d04; color: #0B0C10; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Access Your Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Divider -->
              <tr>
                <td style="padding: 0 40px;">
                  <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
                </td>
              </tr>
              <!-- Footer Note -->
              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <p style="color: #71717a; margin: 0; font-size: 15px; line-height: 1.6;">
                    If you have any questions or need assistance getting set up, simply reply to this email. We're always here to help!
                    <br><br>
                    Best regards,<br>
                <strong style="color: #18181b;">The Click4Jobs Team</strong>
                  </p>
                </td>
              </tr>
              <!-- Dark Footer -->
              <tr>
                <td bgcolor="#f4f4f5" style="padding: 24px; text-align: center;">
                  <p style="color: #a1a1aa; margin: 0; font-size: 13px; font-weight: 500;">
                &copy; ${new Date().getFullYear()} Click4Jobs. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${to}:`, error);
  }
};

export const sendJobAlertEmail = async (to: string, name: string, jobs: any[], keyword: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const jobsListHtml = jobs.map((job) => `
    <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <h3 style="margin: 0 0 5px 0; color: #121212;">${job.title}</h3>
      <p style="margin: 0 0 10px 0; color: #52525b; font-size: 14px;">${job.employerId?.companyName || 'Company'} • ${job.location}</p>
      <a href="${clientUrl}/Condidate/Dashboard" style="display: inline-block; background-color: #0B0C10; color: #e49d04; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px;">View Job</a>
    </div>
  `).join('');

  const mailOptions = {
    from: `"Click4Jobs Alerts" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `New jobs matching "${keyword}" on Click4Jobs!`,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0B0C10;">Daily Job Alert</h2>
      <p>Hi ${name},</p>
      <p>We found some new jobs matching your alert for <strong>"${keyword}"</strong> posted in the last 24 hours:</p>
      ${jobsListHtml}
      <p style="margin-top: 30px; font-size: 0.9em; color: #888;">Manage your alerts in your <a href="${clientUrl}/Condidate/Dashboard" style="color: #e49d04;">Candidate Dashboard</a>.</p>
    </div>
    `,
  };

  try { await transporter.sendMail(mailOptions); } catch (error) { console.error('Failed to send Job Alert email', error); }
};