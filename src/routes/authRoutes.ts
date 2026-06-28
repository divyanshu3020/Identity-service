import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authController } from "../controllers/authController";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireApiKey } from "../middleware/authMiddleware";

export async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/auth/start
   * Start OTP authentication flow
   * @body email -  User email address
   */
  typedApp.post(
    "/start",
    {
      schema: {
        body: z.object({
          email: z.string().email("Invalid email address"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            workflowId: z.string().optional(),
          }),
          400: z.object({
            success: z.literal(false),
            message: z.string(),
            code: z.string().optional(),
            details: z
              .array(
                z.object({
                  field: z.string(),
                  message: z.string(),
                }),
              )
              .optional(),
          }),
          500: z.object({
            success: z.literal(false),
            message: z.string(),
            code: z.string().optional(),
          }),
        },
      },
      preHandler: [requireApiKey],
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "5 minutes",
        },
      },
    },
    authController.startAuth,
  );

  /**
   * POST /api/auth/verify
   * Verify OTP and complete authentication
   * @body phoneNumber - User phone number
   * @body otp - 6-digit OTP
   * @body workflowId - Workflow ID from start auth
   */
  typedApp.post(
    "/verify",
    {
      schema: {
        body: z.object({
          phoneNumber: z.string().min(7, "Invalid phone number"),
          otp: z.string().length(6, "OTP must be 6 digits"),
          workflowId: z.string().min(1, "Workflow ID is required"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z
              .object({
                email: z.string(),
                phoneNumber: z.string(),
                workflowId: z.string(),
              })
              .optional(),
          }),
          400: z.object({
            success: z.literal(false),
            message: z.string(),
            code: z.string().optional(),
            details: z
              .array(
                z.object({
                  field: z.string(),
                  message: z.string(),
                }),
              )
              .optional(),
          }),
          500: z.object({
            success: z.literal(false),
            message: z.string(),
            code: z.string().optional(),
          }),
        },
      },
      preHandler: [requireApiKey],
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 minute",
        },
      },
    },
    authController.verifyOTP,
  );
}
