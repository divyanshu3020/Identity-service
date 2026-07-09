export interface AuthRequest {
  email: string;
}

export interface OTPVerifyRequest {
  phoneNumber: string;
  otp: string;
  email: string;
}

export interface OTPSession {
  otp: string;
  email: string;
  phoneNumber: string;
  expiresAt: Date;
  attempts: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  email?: string;
  expiresIn?: number;
  data?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}
