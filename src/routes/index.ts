import type { FastifyInstance } from "fastify";
import { authRoutes } from "./authRoutes";

export async function router(app: FastifyInstance) {
  // Use "prefix" instead of .use()
  app.register(authRoutes, { prefix: "/auth" });
  
  // You can add more here later:
  // app.register(userRoutes, { prefix: "/users" });
}