import crypto from "crypto";

/**
 * Decrypt gift card details
 * Uses AES-256-GCM encryption matching the encryption in seed.ts
 * Throws error on failure - must be caught by caller
 * 
 * @param encrypted - Base64 encoded encrypted text
 * @param iv - Base64 encoded initialization vector
 * @param tag - Base64 encoded authentication tag
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails
 */
export function decrypt(encrypted: string, iv: string, tag: string): string {
  try {
    if (!process.env.ENCRYPTION_SECRET) {
      throw new Error('ENCRYPTION_SECRET not configured');
    }

    const key = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET).digest();
    const ivBuffer = Buffer.from(iv, "base64");
    const tagBuffer = Buffer.from(tag, "base64");
    const encryptedBuffer = Buffer.from(encrypted, "base64");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBuffer);
    decipher.setAuthTag(tagBuffer);

    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    // Re-throw with generic message - never expose decryption details
    throw new Error('Decryption failed');
  }
}