import type { FastifyInstance } from "fastify";
import { authRoutes } from "./authRoutes";
import { apiKeyRoutes } from "./apiKeyRoutes";

export async function router(app: FastifyInstance) {
  // Use "prefix" instead of .use()
  app.register(authRoutes, { prefix: "/auth" });
  app.register(apiKeyRoutes, { prefix: "/admin/keys" });
  
  // You can add more here later:
  // app.register(userRoutes, { prefix: "/users" });
}