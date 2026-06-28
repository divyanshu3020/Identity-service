import crypto from "crypto";

export function generateApiKey(): { rawKey: string; keyHash: string } {
  // Generate a random 32-byte string, then convert to base64url format
  // Prefix with something recognizable
  const randomBuffer = crypto.randomBytes(32);
  const rawKey = `sk_${randomBuffer.toString("base64url")}`;

  // Hash the key for storage in the database (SHA-256 is sufficient here)
  const keyHash = hashApiKey(rawKey);

  return { rawKey, keyHash };
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}
