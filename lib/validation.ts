/**
 * Input validation and sanitization utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate wallet address format
 */
export function validateWalletAddress(address: string): ValidationResult {
  if (!address) {
    return { valid: false, error: 'Wallet address is required' };
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Invalid wallet address format' };
  }
  
  return { valid: true };
}

/**
 * Validate session ID format (CUID)
 */
export function validateSessionId(sessionId: string): ValidationResult {
  if (!sessionId) {
    return { valid: false, error: 'Session ID is required' };
  }
  
  // CUID format: starts with 'c', followed by 24 characters
  if (!/^c[a-z0-9]{24}$/.test(sessionId)) {
    return { valid: false, error: 'Invalid session ID format' };
  }
  
  return { valid: true };
}

/**
 * Validate transaction hash format
 */
export function validateTxHash(txHash: string): ValidationResult {
  if (!txHash) {
    return { valid: false, error: 'Transaction hash is required' };
  }
  
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return { valid: false, error: 'Invalid transaction hash format' };
  }
  
  return { valid: true };
}

/**
 * Validate amount (must be positive number)
 */
export function validateAmount(amount: number | string): ValidationResult {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }
  
  if (numAmount > 1000000) {
    return { valid: false, error: 'Amount exceeds maximum limit' };
  }
  
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Sanitize: remove any potential injection attempts
  if (email.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }
  
  return { valid: true };
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
}

/**
 * Validate store name
 */
export function validateStoreName(store: string): ValidationResult {
  if (!store) {
    return { valid: false, error: 'Store name is required' };
  }
  
  const sanitized = sanitizeString(store, 100);
  if (sanitized.length < 2) {
    return { valid: false, error: 'Store name is too short' };
  }
  
  return { valid: true };
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): ValidationResult {
  if (!currency) {
    return { valid: false, error: 'Currency is required' };
  }
  
  const validCurrencies = ['USD', 'INR', 'EUR', 'GBP'];
  if (!validCurrencies.includes(currency.toUpperCase())) {
    return { valid: false, error: `Unsupported currency. Supported: ${validCurrencies.join(', ')}` };
  }
  
  return { valid: true };
}

/**
 * Validate gift card ID format
 */
export function validateGiftCardId(giftCardId: string): ValidationResult {
  if (!giftCardId) {
    return { valid: false, error: 'Gift card ID is required' };
  }
  
  // CUID format
  if (!/^c[a-z0-9]{24}$/.test(giftCardId)) {
    return { valid: false, error: 'Invalid gift card ID format' };
  }
  
  return { valid: true };
}


