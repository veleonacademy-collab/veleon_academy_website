import axios from "axios";
import { env } from "../config/env.js";

// Brevo API instance
const brevoClient = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    "api-key": env.email.brevoApiKey,
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Verify API key on startup
if (env.nodeEnv === "development") {
  if (!env.email.brevoApiKey || env.email.brevoApiKey === "") {
    console.warn("⚠️ BREVO_API_KEY is missing in your .env file. Email delivery will likely fail.");
  } else {
    // Check account status as a ping
    brevoClient.get("/account")
      .then(() => console.log("✅ Brevo API is ready to send emails"))
      .catch((err) => {
        console.error("❌ Brevo API configuration error:", err.response?.data?.message || err.message);
        console.log("💡 Please check your BREVO_API_KEY in .env file");
      });
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Brevo HTTP API
 * Faster and more reliable on platforms like Render than SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log("==================================================================");
  console.log("📧 Email Service (API) - Sending Email:");
  console.log("------------------------------------------------------------------");
  console.log("To:", options.to);
  console.log("Subject:", options.subject);
  console.log("==================================================================");

  try {
    const payload = {
      sender: {
        name: env.email.fromName,
        email: env.email.from,
      },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text || options.subject, // Fallback text
      replyTo: { email: env.email.from },
    };

    const response = await brevoClient.post("/smtp/email", payload);

    if (env.nodeEnv === "development") {
      console.log("📧 Email sent via API:", response.data.messageId);
      console.log("   To:", options.to);
      console.log("   Subject:", options.subject);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("❌ Error sending email via Brevo API:", errorMsg);
    if (error.response?.data?.errors) {
      console.error("   Details:", JSON.stringify(error.response.data.errors, null, 2));
    }
    throw new Error(`Failed to send email: ${errorMsg}`);
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
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🚀 Your Tech Future Starts NOW!</h1>
            <p style="margin-top: 10px; font-size: 18px; opacity: 0.9;">The most successful people in tech don't wait — they act.</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName},</h2>
            
            <p style="font-size: 20px; font-weight: 700; color: #d11c07; margin-bottom: 15px;">🔥 Welcome! Here are our courses — pick yours today</p>
            <p style="font-size: 16px; margin-bottom: 20px; color: #444;">Tech is the #1 path to a <strong>six-figure salary</strong> and career freedom. Don't let this opportunity slip away while others are out-earning you.</p>
            
            <div style="text-align: center; margin-bottom: 35px;">
              <a href="${env.appUrl}/courses" style="display: inline-block; padding: 18px 36px; background-color: #d11c07; color: #ffffff !important; text-decoration: none !important; border-radius: 8px; font-weight: 800; font-size: 18px; box-shadow: 0 6px 15px rgba(209, 28, 7, 0.4); text-transform: uppercase;">GET STARTED (FROM 4 INSTALLMENTS)</a>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 25px;">Your account is ready. Log in below to access your premium dashboard, expert recordings, and life-changing assignments.</p>
            
            <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border: 1px dashed #00a9c0; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #007d8f; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Access Credentials</h3>
              <p style="margin: 10px 0; font-family: monospace; font-size: 15px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0; font-family: monospace; font-size: 15px;"><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p style="text-align: center;">
              <a href="${portalUrl}" style="background-color: #00a9c0; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">Log In to Your Portal</a>
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;"><em>Important: Seats are filling fast. High-demand courses close enrollment without notice.</em></p>
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
    subject: "🔥 You're In! Start Your High-Paying Tech Career Today",
    html,
    text: `URGENT: Your tech future starts now! Browse courses: ${env.appUrl}/courses\n\nHi ${firstName}, tech is the fastest way to a six-figure salary. Your portal is ready at ${portalUrl}. Email: ${email}, Temporary Password: ${password}. Secure your spot before it's too late!`,
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
            background: linear-gradient(135deg, #00a9c0 0%, #007d8f 100%);
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
            background: linear-gradient(135deg, #d11c07 0%, #b01806 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
            box-shadow: 0 4px 12px rgba(209, 28, 7, 0.2);
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
            color: #00a9c0;
            word-break: break-all;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 You've Taken the First Step!</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            
            <p><strong>Congratulations!</strong> By registering, you've just taken the first step toward your future—a step that is already better than most people who only talk about their dreams but never start.</p>
            
            <p>You’re already ahead of the curve. The next step is to now proceed to choose your course. We recommend doing this as soon as possible, as our <strong>seats are filling up fast</strong>.</p>
            
            <p>Please verify your email below to secure your registration and continue your journey.</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">VERIFY MY EMAIL NOW</a>
            </div>
            
            <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
            <p class="link">${verificationUrl}</p>
            <p style="margin-top: 30px; font-size: 14px; color: #888;">
              <strong>Note:</strong> This verification link expires in 24 hours. After that, your data will be purged.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${env.email.fromName}. Your future starts today.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    🚀 You've Taken the First Step!
    
    Hi ${firstName}, 
    
    Congratulations! By registering, you've just taken the first step toward your future—a step that is already better than most people who never start.
    
    The next step is to now proceed to choose your course. Seats are filling up fast, so we recommend picking yours today.
    
    VERIFY YOUR EMAIL NOW: ${verificationUrl}
    
    Note: This link expires in 24 hours. 
    
    © ${new Date().getFullYear()} ${env.email.fromName}. Your future starts today.
  `;

  await sendEmail({
    to: email,
    subject: "Verification Email: Congratulations on taking the first step! 🚀",
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

/**
 * Send payment reminder email for users who haven't enrolled
 */
export async function sendPaymentReminderEmail(
  email: string,
  firstName: string,
  is24h: boolean
): Promise<void> {
  const portalUrl = `${env.appUrl}/courses`;
  const subject = "You're one step away — complete your enrollment today";
  
  const mainTitle = is24h ? "🚨 FINAL REMINDER: Your Spot is Expiring" : "🚀 Your Tech Journey Starts Here, " + firstName;
  const subTitle = is24h ? "This is your last chance to secure flexible installment options and bonuses." : "You're just one step away from joining the next generation of tech leaders.";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 60px 40px; text-align: center; color: white; }
          .urgent-badge { display: inline-block; background: #d11c07; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; color: white; }
          .content { padding: 40px; }
          .benefit-item { display: flex; align-items: flex-start; margin-bottom: 20px; }
          .benefit-icon { background: #fee2e2; color: #d11c07; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
          .cta-button { display: inline-block; width: 100%; padding: 22px 0; background: linear-gradient(135deg, #ff4d00 0%, #d11c07 100%); color: #ffffff !important; text-decoration: none !important; border-radius: 12px; font-weight: 900; font-size: 20px; text-align: center; box-shadow: 0 12px 30px rgba(209, 28, 7, 0.5); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; }
          .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="hero">
            <div class="urgent-badge">${is24h ? "Urgent: Action Required" : "Achievement Unlocked: Almost There"}</div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 800; line-height: 1.2;">${mainTitle}</h1>
            <p style="margin-top: 15px; font-size: 18px; opacity: 0.9;">${subTitle}</p>
          </div>
          <div class="content">
            <p style="font-size: 16px; line-height: 1.7;">
              Hi ${firstName}, <br><br>
              The most successful people in tech share one trait: <strong>Speed.</strong> <br><br>
              While others are still dreaming about a career change, our students are already building their futures. Every hour you wait is an hour someone else is mastering the skills that command <strong>six-figure salaries.</strong>
            </p>

            <div style="background: #fff1f0; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px dashed #d11c07;">
              <h3 style="margin-top: 0; color: #d11c07; font-size: 18px;">Why Veleon Academy?</h3>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div><strong>Effective Learning (Max 10 Students):</strong> High-impact, personalized training in elite cohorts.</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div><strong>Live Expert Mentorship:</strong> Not just recorded videos — real-time interaction with masters.</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div><strong>Flexible Installments:</strong> Premium education that fits your budget.</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div><strong>Career Outcomes:</strong> Build real-world apps that we help you turn into job offers.</div>
              </div>
            </div>

            <p style="text-align: center; margin-bottom: 15px; font-weight: bold; color: #d11c07; font-size: 18px;">⌛ Only a few spots remaining for this cohort.</p>
            <a href="${portalUrl}" class="cta-button">SECURE MY SPOT (INSTALLMENTS AVAILABLE) →</a>
            
            <p style="text-align: center; font-size: 14px; color: #64748b; margin-top: 20px;">
              Your future self will thank you.
            </p>
          </div>
          <div class="footer">
            <p>You received this because you recently created an account at Veleon Academy.</p>
            <p>&copy; ${new Date().getFullYear()} Veleon Academy • Career Growth Division</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text: `Hi ${firstName}, you're one step away! Complete your enrollment today at ${portalUrl}. The tech world moves fast—don't let your spot be taken by someone else. Enroll now: ${portalUrl}`
  });
}
