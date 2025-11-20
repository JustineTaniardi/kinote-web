/**
 * Email templates for password reset and verification
 */

import crypto from "crypto";

interface EmailTemplate {
  subject: string;
  html: string;
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getResetPasswordEmailTemplate(
  userName: string,
  resetToken: string
): EmailTemplate {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3001"}/reset-password?token=${resetToken}`;
  
  return {
    subject: "Reset Your Password",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Reset Your Password</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>Kinote Team</p>
        </body>
      </html>
    `,
  };
}

export function getVerificationEmailTemplate(
  userName: string,
  verificationToken: string
): EmailTemplate {
  const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3001"}/verify-email?token=${verificationToken}`;
  
  return {
    subject: "Verify Your Email",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Verify Your Email</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>Kinote Team</p>
        </body>
      </html>
    `,
  };
}
