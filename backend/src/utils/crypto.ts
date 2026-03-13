import { createHash } from "crypto";

/**
 * Hashes a string using SHA-256 for PII (Personally Identifiable Information)
 * as required by TikTok and other analytics platforms.
 */
export function hashPII(data: string | undefined): string | undefined {
  if (!data) return undefined;
  
  // Normalize: lowercase and trim
  const normalized = data.trim().toLowerCase();
  
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Generates a random event ID
 */
export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
