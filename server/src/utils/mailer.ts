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
    from: `"JobPortal" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Your JobPortal Verification Code',
    html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;"><h2 style="color: #0B0C10;">Verify Your Email Address</h2><p>Welcome to JobPortal! To complete your registration, please use the following One-Time Password (OTP):</p><p style="background: #f2f2f2; border-radius: 8px; padding: 10px 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #0B0C10;">${otp}</p><p>This code is valid for 10 minutes.</p><p>If you did not request this, you can safely ignore this email.</p><hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" /><p style="font-size: 0.9em; color: #888;">Best regards,<br>The JobPortal Team</p></div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${to}:`, error);
    throw new Error('Failed to send verification email. Please check server logs.');
  }
};