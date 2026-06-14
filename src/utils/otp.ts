import crypto from "crypto";
import { AUTH_CONSTANTS } from "../constants/auth";

export const generateOTP = (): string => {
  return Math.floor(Math.random() * Math.pow(10, AUTH_CONSTANTS.OTP_LENGTH))
    .toString()
    .padStart(AUTH_CONSTANTS.OTP_LENGTH, "0");
};

export const generateWorkflowId = (): string => {
  return crypto.randomBytes(12).toString("hex");
};

export const calculateOTPExpiry = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + AUTH_CONSTANTS.OTP_EXPIRY_MINUTES * 60000);
};

export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phoneNumber);
};
