import {
  generateOTP,
  generateWorkflowId,
  calculateOTPExpiry,
  isOTPExpired,
  isValidEmail,
  isValidPhoneNumber,
} from "../utils/otp";
import { sendOTPEmail } from "../utils/email";
import type { OTPSession, AuthResponse, ErrorResponse } from "../types/auth";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/auth";
import { db } from "../config/db";

export const authService = {
  async startAuth(email: string): Promise<AuthResponse | ErrorResponse> {
    try {
      // Validate email format  
      if (!isValidEmail(email)) {
        return {
          success: false,
          message: "Invalid email format",
          code: "INVALID_EMAIL",
        };
      }

      // Check if email already has an active session
      const existingSession = await db.oTPSession.findFirst({
        where: {
          email,
          expiresAt: {
            gt: new Date(), // OTP not expired
          },
        },
      });

      if (existingSession) {
        return {
          success: false,
          message:
            "Active OTP session already exists for this email. Please wait before requesting a new OTP.",
          code: "ACTIVE_SESSION_EXISTS",
        };
      }

      // Generate OTP and workflow ID
      const otp = generateOTP();
      const expiresAt = calculateOTPExpiry();

      // Store OTP session in database
      const session = await db.oTPSession.create({
        data: {
          otp,
          email,
          expiresAt,
          attempts: 0,
        },
      });

      // Send OTP via email
      const emailSent = await sendOTPEmail(email, otp);

      if (!emailSent) {
        await db.oTPSession.delete({
          where: { id: session.id },
        });
        return {
          success: false,
          message:
            "Failed to send OTP email. Please check your email address and try again.",
          code: "EMAIL_SEND_FAILED",
        };
      }

      // Log in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] OTP for ${email}: ${otp}`);
      }

      return {
        success: true,
        message: "OTP sent successfully. Check your email.",
        expiresIn: Math.round((expiresAt.getTime() - Date.now()) / 1000),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[authService.startAuth] Error:", errorMsg, error);
      return {
        success: false,
        message: "Failed to initiate authentication. Please try again later.",
        code: "START_AUTH_ERROR",
      };
    }
  },

  async verifyOTP(
    email: string,
    otp: string,
    phoneNumber: string,
  ): Promise<AuthResponse | ErrorResponse> {
    try {
      // Validate inputs
      if (!email || !otp || !phoneNumber) {
        return {
          success: false,
          message: "Missing required fields: email, otp, and phoneNumber",
          code: "MISSING_FIELDS",
        };
      }

      // Validate phone number format
      if (!isValidPhoneNumber(phoneNumber)) {
        return {
          success: false,
          message:
            "Invalid phone number format. Please enter a valid phone number.",
          code: "INVALID_PHONE",
        };
      }

      // Get OTP session from database
      const session = await db.oTPSession.findUnique({
        where: { email },
      });

      if (!session) {
        return {
          success: false,
          message:
            "Invalid email. The OTP session may have expired or does not exist.",
          code: "EMAIL_NOT_FOUND",
        };
      }

      // Check if OTP is expired
      if (isOTPExpired(session.expiresAt)) {
        await db.oTPSession.delete({
          where: { id: session.id },
        });
        return {
          success: false,
          message: "OTP has expired. Please request a new OTP.",
          code: "OTP_EXPIRED",
        };
      }

      // Check attempts
      if (session.attempts >= 3) {
        await db.oTPSession.delete({
          where: { id: session.id },
        });
        return {
          success: false,
          message:
            "Maximum OTP verification attempts exceeded. Please request a new OTP.",
          code: "MAX_ATTEMPTS_EXCEEDED",
        };
      }

      // Verify OTP
      if (session.otp !== otp) {
        const newAttempts = session.attempts + 1;
        const remainingAttempts = 3 - newAttempts;

        if (remainingAttempts <= 0) {
          await db.oTPSession.delete({
            where: { id: session.id },
          });
          return {
            success: false,
            message: "Maximum OTP verification attempts exceeded. Please request a new OTP.",
            code: "MAX_ATTEMPTS_EXCEEDED",
          };
        } else {
          await db.oTPSession.update({
            where: { id: session.id },
            data: { attempts: newAttempts },
          });
          return {
            success: false,
            message: `Invalid OTP. You have ${remainingAttempts} attempt(s) remaining.`,
            code: "INVALID_OTP",
          };
        }
      }

      // OTP verified successfully
      // Create or update user in database
      const user = await db.user.upsert({
        where: { email: session.email },
        update: { phoneNumber },
        create: { email: session.email, phoneNumber },
      });

      // Update session with user ID and phone number
      await db.oTPSession.update({
        where: { id: session.id },
        data: { phoneNumber, userId: user.id },
      });

      // Return success with user data
      const userData = {
        email: user.email,
        phoneNumber: user.phoneNumber,
      };

      // Clean up the session
      await db.oTPSession.delete({
        where: { id: session.id },
      });

      return {
        success: true,
        message: "OTP verified successfully",
        data: userData,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[authService.verifyOTP] Error:", errorMsg, error);
      return {
        success: false,
        message: "Failed to verify OTP. Please try again later.",
        code: "VERIFY_OTP_ERROR",
      };
    }
  },
};
