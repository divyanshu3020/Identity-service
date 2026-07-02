import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { AUTH_CONSTANTS } from "../constants/auth";

let transporter: Transporter | null = null;

const initializeTransporter = async (): Promise<Transporter> => {
  if (transporter) return transporter;

  // For development, using Ethereal Email (nodemailer test account)
  // For production, configure with real SMTP credentials via env variables
  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Ethereal test account
    let user = process.env.ETHEREAL_USER;
    let pass = process.env.ETHEREAL_PASS;

    if (!user || !pass || user === "your-ethereal-user") { 
      console.log("[DEV] Generating new Ethereal test account...");
      const testAccount = await nodemailer.createTestAccount();
      user = testAccount.user;
      pass = testAccount.pass;
      console.log(`[DEV] Ethereal credentials generated. User: ${user}`);
    }

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
};

export const sendOTPEmail = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  try {
    const transport = await initializeTransporter();

    const mailOptions = {
      from: AUTH_CONSTANTS.EMAIL_FROM,
      to: email,
      subject: AUTH_CONSTANTS.EMAIL_SUBJECT,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your One-Time Password</h2>
          <p>Your OTP for Parking Service authentication is:</p>
          <h1 style="color: #007bff; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
          <p>This OTP will expire in ${AUTH_CONSTANTS.OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 12px;">If you did not request this OTP, please ignore this email.</p>
        </div>
      `,
      text: `Your OTP is: ${otp}. It will expire in ${AUTH_CONSTANTS.OTP_EXPIRY_MINUTES} minutes.`,
    };

    const info = await transport.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV] Email sent to Ethereal!");
      console.log("[DEV] Preview URL: " + nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};
