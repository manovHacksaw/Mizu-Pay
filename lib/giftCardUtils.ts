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
      console.error('Decryption error: ENCRYPTION_SECRET not configured');
      throw new Error('ENCRYPTION_SECRET not configured');
    }

    // Validate inputs
    if (!encrypted || !iv || !tag) {
      console.error('Decryption error: Missing required parameters', {
        hasEncrypted: !!encrypted,
        hasIv: !!iv,
        hasTag: !!tag,
      });
      throw new Error('Missing encryption parameters');
    }

    const key = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET).digest();
    
    // Validate base64 encoding
    let ivBuffer: Buffer;
    let tagBuffer: Buffer;
    let encryptedBuffer: Buffer;
    
    try {
      ivBuffer = Buffer.from(iv, "base64");
      tagBuffer = Buffer.from(tag, "base64");
      encryptedBuffer = Buffer.from(encrypted, "base64");
    } catch (base64Error) {
      console.error('Decryption error: Invalid base64 encoding', {
        error: base64Error instanceof Error ? base64Error.message : String(base64Error),
        ivLength: iv?.length,
        tagLength: tag?.length,
        encryptedLength: encrypted?.length,
      });
      throw new Error('Invalid base64 encoding');
    }

    // Validate buffer sizes
    if (ivBuffer.length !== 16) {
      console.error('Decryption error: Invalid IV length', { length: ivBuffer.length });
      throw new Error('Invalid IV length');
    }

    if (tagBuffer.length !== 16) {
      console.error('Decryption error: Invalid tag length', { length: tagBuffer.length });
      throw new Error('Invalid tag length');
    }

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBuffer);
    decipher.setAuthTag(tagBuffer);

    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    // Log the actual error for debugging (but don't expose sensitive details)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    console.error('Decryption error details:', {
      errorName,
      errorMessage,
      // Don't log the actual encrypted data, iv, or tag for security
    });
    
    // Re-throw with generic message - never expose decryption details
    throw new Error('Decryption failed');
  }
}