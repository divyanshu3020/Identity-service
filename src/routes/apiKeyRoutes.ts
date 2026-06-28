import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { apiKeyController } from "../controllers/apiKeyController";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export async function apiKeyRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/admin/keys/generate
   * Generate a new API key for a developer.
   * Note: In a real SaaS, this should be protected by Admin auth or Developer Dashboard session.
   * For this lightweight service, we leave it open or you could protect it with a MASTER_KEY.
   * @body name - Descriptive name for the key
   */
  typedApp.post(
    "/generate",
    {
      schema: {
        body: z.object({
          name: z.string().min(1, "Name is required"),
        }),
        response: {
          201: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              name: z.string(),
              apiKey: z.string(),
            }),
          }),
          500: z.object({
            success: z.literal(false),
            message: z.string(),
            code: z.string().optional(),
          }),
        },
      },
    },
    apiKeyController.generate,
  );
}
