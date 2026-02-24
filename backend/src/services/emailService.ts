import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Create reusable transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: env.email.smtp.host,
  port: env.email.smtp.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.email.smtp.user,
    pass: env.email.smtp.pass,
  },
});

// Verify transporter configuration on startup (only in development)
if (env.nodeEnv === "development") {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email service configuration error:", error.message);
      console.log("💡 Please configure your Brevo SMTP credentials in .env file");
    } else {
      console.log("✅ Email service is ready to send emails");
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Brevo SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log("==================================================================");
  console.log("📧 Email Service (Simulation) - Logging Email Content:");
  console.log("------------------------------------------------------------------");
  console.log("To:", options.to);
  console.log("Subject:", options.subject);
  console.log("Text Body:", options.text);
  console.log("==================================================================");

  try {
    const info = await transporter.sendMail({
      from: `"${env.email.fromName}" <${env.email.from}>`,
      replyTo: env.email.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (env.nodeEnv === "development") {
      console.log("📧 Email sent:", info.messageId);
      console.log("   To:", options.to);
      console.log("   Subject:", options.subject);
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Send welcome email to new student with credentials
 */
export async function sendStudentWelcomeEmail(
  email: string,
  password: string,
  firstName: string
): Promise<void> {
  const portalUrl = `${env.appUrl}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #00a9c0 0%, #007d8f 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Welcome to Veleon Academy!</h1>
            <p style="margin-top: 10px; font-size: 18px; opacity: 0.9;">Your journey to tech excellence starts here</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName},</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">Your account has been successfully created. You can now access our premium tech courses, recordings, and assignments.</p>
            
            <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border: 1px dashed #00a9c0; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #007d8f; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Access Credentials</h3>
              <p style="margin: 10px 0; font-family: monospace; font-size: 15px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0; font-family: monospace; font-size: 15px;"><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p style="text-align: center;">
              <a href="${portalUrl}" style="background-color: #00a9c0; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">Log In to Your Portal</a>
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;"><em>Please change your password after your first login for security.</em></p>
          </div>
          <div style="background: #fdfdfd; padding: 20px 30px; text-align: center; border-top: 1px solid #eee; color: #888; font-size: 14px;">
            <p>&copy; ${new Date().getFullYear()} Veleon Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to Veleon Academy - Your Account is Ready",
    html,
    text: `Welcome to Veleon Academy! Your login email is ${email} and your temporary password is ${password}. Access your portal at ${portalUrl}`,
  });
}

/**
 * Send notification for a new class recording
 */
export async function sendRecordingNotificationEmail(
  email: string,
  firstName: string,
  courseTitle: string,
  recordingTitle: string,
  recordingUrl: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Hi ${firstName}, New Class Recording Available</h2>
      <p>A new recording for <strong>${courseTitle}</strong> has been uploaded: <strong>${recordingTitle}</strong></p>
      <p>You can watch it now using the link below:</p>
      <p><a href="${recordingUrl}">Watch Recording</a></p>
      <p>Or log in to your portal to see all recordings for this course.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `New Recording: ${courseTitle} - ${recordingTitle}`,
    html,
  });
}

/**
 * Send verification email with token
 */
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string
): Promise<void> {
  const verificationUrl = `${env.appUrl}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            margin: 0 0 20px;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e9ecef;
          }
          .link {
            color: #667eea;
            word-break: break-all;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome!</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Thank you for registering! Please verify your email address to activate your account.</p>
            <p>Click the button below to verify your email:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p class="link">${verificationUrl}</p>
            <p style="margin-top: 30px; font-size: 14px; color: #888;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome!
    
    Hi ${firstName},
    
    Thank you for registering! Please verify your email address to activate your account.
    
    Click the link below to verify your email:
    ${verificationUrl}
    
    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
    
    © ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html,
    text,
  });
}

/**
 * Send password reset email with token
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.appUrl}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            margin: 0 0 20px;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e9ecef;
          }
          .link {
            color: #f5576c;
            word-break: break-all;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p class="link">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Password Reset
    
    Hi ${firstName},
    
    We received a request to reset your password. Click the link below to create a new password:
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
    
    © ${new Date().getFullYear()} ${env.email.fromName}. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
    text,
  });
}

/**
 * Send enrollment confirmation email
 */
export async function sendEnrollmentConfirmationEmail(
  email: string,
  firstName: string,
  courseTitle: string
): Promise<void> {
  const portalUrl = `${env.appUrl}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #00a9c0 0%, #007d8f 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Enrollment Confirmed!</h1>
            <p style="margin-top: 10px; font-size: 18px; opacity: 0.9;">Welcome to your new learning journey</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName},</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">Congratulations! You have successfully enrolled in <strong>${courseTitle}</strong>. We are thrilled to have you as part of Veleon Academy.</p>
            
            <div style="background: #f8fcfd; border-radius: 8px; padding: 25px; border-left: 4px solid #00a9c0; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #007d8f; font-size: 18px;">What's Next?</h3>
              <ul style="padding-left: 20px; margin-bottom: 0;">
                <li style="margin-bottom: 10px;">Access your course materials and dashboard</li>
                <li style="margin-bottom: 10px;">Check the class timetable</li>
                <li style="margin-bottom: 10px;">Connect with your tutor and fellow students</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="${portalUrl}" style="background-color: #00a9c0; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; transition: background 0.3s;">Access Student Portal</a>
            </p>
          </div>
          <div style="background: #fdfdfd; padding: 20px 30px; text-align: center; border-top: 1px solid #eee; color: #888; font-size: 14px;">
            <p>If you have any questions, feel free to reply to this email.</p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Veleon Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Enrollment Confirmed: ${courseTitle} - Veleon Academy`,
    html,
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  email: string,
  firstName: string,
  amount: number,
  currency: string,
  description: string,
  reference: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: #333; padding: 30px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Payment Receipt</h1>
            <p style="margin-top: 5px; opacity: 0.8;">Thank you for your payment</p>
          </div>
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; font-weight: 700; color: #00a9c0;">
                ${currency} ${amount.toLocaleString()}
              </div>
              <p style="color: #888; margin-top: 5px;">Transaction Reference: ${reference}</p>
            </div>

            <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0; margin-bottom: 30px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #888;">Name</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600;">${firstName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888;">Description</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600;">${description}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888;">Date</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600;">${new Date().toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #888; text-align: center;">
              This is an automated receipt for your payment to Veleon Academy. Please keep this for your records.
            </p>
          </div>
          <div style="background: #fdfdfd; padding: 20px 30px; text-align: center; border-top: 1px solid #eee; color: #888; font-size: 14px;">
            <p>&copy; ${new Date().getFullYear()} Veleon Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Payment Receipt: ${description}`,
    html,
  });
}

/**
 * Send assignment notification email
 */
export async function sendAssignmentNotificationEmail(
  email: string,
  firstName: string,
  courseTitle: string,
  assignmentTitle: string,
  dueDate: string
): Promise<void> {
  const portalUrl = `${env.appUrl}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: #d11c07; padding: 30px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">New Assignment Posted</h1>
            <p style="margin-top: 5px; opacity: 0.9;">Stay on track with your learning</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${firstName},</h2>
            <p style="font-size: 16px;">A new assignment has recently been posted for your course: <strong>${courseTitle}</strong></p>
            
            <div style="background: #fff5f4; border-left: 4px solid #d11c07; padding: 20px; border-radius: 4px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #d11c07;">${assignmentTitle}</h3>
              <p style="margin-bottom: 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${portalUrl}" style="background-color: #d11c07; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Assignment in Portal</a>
            </p>
          </div>
          <div style="background: #fdfdfd; padding: 20px 30px; text-align: center; border-top: 1px solid #eee; color: #888; font-size: 14px;">
            <p>&copy; ${new Date().getFullYear()} Veleon Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `New Assignment: ${courseTitle} - ${assignmentTitle}`,
    html,
  });
}
