import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "@repo/database";
import { generateApiKey } from "../utils/apiKey";

export const apiKeyController = {
  async generate(request: FastifyRequest, reply: FastifyReply) {
    const { name } = request.body as { name: string };

    try {
      const { rawKey, keyHash } = generateApiKey();

      // Store in database
      const apiKeyRecord = await db.apiKey.create({
        data: {
          keyHash,
          name,
        },
      });

      // ONLY return the raw key once upon creation!
      // The developer must save this key.
      return reply.status(201).send({
        success: true,
        message: "API Key generated successfully. Please save this key now as it cannot be retrieved again.",
        data: {
          id: apiKeyRecord.id,
          name: apiKeyRecord.name,
          apiKey: rawKey,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Failed to generate API Key",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  },
};
