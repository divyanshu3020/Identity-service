export interface AuthRequest {
  email: string;
}

export interface OTPVerifyRequest {
  phoneNumber: string;
  otp: string;
  workflowId: string;
}

export interface OTPSession {
  otp: string;
  email: string;
  phoneNumber: string;
  workflowId: string;
  expiresAt: Date;
  attempts: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  workflowId?: string;
  expiresIn?: number;
  data?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}
