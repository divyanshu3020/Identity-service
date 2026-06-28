import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "@repo/database";
import { hashApiKey } from "../utils/apiKey";

export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const apiKey = request.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    return reply.status(401).send({
      success: false,
      message: "Missing API Key in headers (x-api-key)",
      code: "UNAUTHORIZED",
    });
  }

  try {
    const keyHash = hashApiKey(apiKey);

    // Look up the hashed key in the database
    const validKey = await db.apiKey.findUnique({
      where: { keyHash },
    });

    if (!validKey) {
      return reply.status(401).send({
        success: false,
        message: "Invalid API Key",
        code: "UNAUTHORIZED",
      });
    }

    // Attach the API key metadata to the request if needed by controllers
    (request as any).apiKeyData = validKey;
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Internal server error during authentication",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
