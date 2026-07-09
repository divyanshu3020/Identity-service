import type { FastifyReply, FastifyRequest } from "fastify";
import { authService } from "../services/authService";
import type { AuthRequest, OTPVerifyRequest } from "../types/auth";

export const authController = {
  async startAuth(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.body as AuthRequest;

      if (!email) {
        return reply.status(400).send({
          success: false,
          message: "Email is required",
          code: "MISSING_EMAIL",
          details: [
            {
              field: "email",
              message: "Email is required",
            },
          ],
        });
      }

      const result = await authService.startAuth(email);

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.status(200).send(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      request.log.error(error as any, `[START_AUTH] Error: ${errorMsg}`);

      return reply.status(500).send({
        success: false,
        message: "Failed to start authentication",
        code: "START_AUTH_ERROR",
        details: [
          {
            field: "email",
            message: "Unable to process email. Please try again later.",
          },
        ],
      });
    }
  },

  async verifyOTP(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { phoneNumber, otp, email } = request.body as OTPVerifyRequest;

      // Validate all required fields
      const missingFields = [];
      if (!phoneNumber)
        missingFields.push({ field: "phoneNumber", message: "Phone number is required" });
      if (!otp) missingFields.push({ field: "otp", message: "OTP is required" });
      if (!email)
        missingFields.push({ field: "email", message: "email is required" });

      if (missingFields.length > 0) {
        return reply.status(400).send({
          success: false,
          message: "Missing required fields",
          code: "MISSING_FIELDS",
          details: missingFields,
        });
      }

      const result = await authService.verifyOTP(email, otp, phoneNumber);

      if (!result.success) {
        return reply.status(400).send(result);
      }

      return reply.status(200).send(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      request.log.error(error as any, `[VERIFY_OTP] Error: ${errorMsg}`);

      return reply.status(500).send({
        success: false,
        message: "Failed to verify OTP",
        code: "VERIFY_OTP_ERROR",
        details: [
          {
            field: "verification",
            message: "Unable to verify OTP. Please try again later.",
          },
        ],
      });
    }
  },
};
