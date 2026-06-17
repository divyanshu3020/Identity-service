export const AUTH_CONSTANTS = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_OTP_ATTEMPTS: 3,
  WORKFLOW_ID_LENGTH: 24,
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@parking.com",
  EMAIL_SUBJECT: "Your OTP for Parking Service",
};

export const ERROR_MESSAGES =  {
  INVALID_EMAIL: "Invalid email format",
  INVALID_OTP: "Invalid OTP provided",
  OTP_EXPIRED: "OTP has expired",
  MAX_ATTEMPTS_EXCEEDED: "Maximum OTP attempts exceeded",
  WORKFLOW_NOT_FOUND: "Workflow not found",
  INTERNAL_ERROR: "Internal server error",
  EMAIL_SEND_FAILED: "Failed to send email",
};

export const SUCCESS_MESSAGES = {
  OTP_SENT: "OTP sent successfully to your email",
  OTP_VERIFIED: "OTP verified successfully",
};
