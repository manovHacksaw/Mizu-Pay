'use client';

import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

export { sonnerToast as toast };
export const Toaster = SonnerToaster;

/**
 * Toast notification utilities with user-friendly messages using Sonner
 */
export const showSuccess = (message: string) => {
  sonnerToast.success(message, {
    duration: 4000,
  });
};

export const showError = (message: string, options?: { duration?: number }) => {
  sonnerToast.error(message, {
    duration: options?.duration || 5000,
  });
};

export const showInfo = (message: string) => {
  sonnerToast.info(message, {
    duration: 3000,
  });
};

export const showLoading = (message: string) => {
  return sonnerToast.loading(message);
};

/**
 * User-friendly error messages
 */
export const getUserFriendlyError = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Wallet errors
    if (message.includes('wallet') || message.includes('user rejected')) {
      return 'Transaction was cancelled. Please try again when ready.';
    }
    
    // Insufficient balance
    if (message.includes('insufficient') || message.includes('balance')) {
      return 'Insufficient balance. Please add funds to your wallet.';
    }
    
    // Session errors
    if (message.includes('session') && message.includes('expired')) {
      return 'Your session has expired. Please start a new checkout.';
    }
    
    // Gift card errors
    if (message.includes('gift card') && message.includes('unavailable')) {
      return 'This gift card is no longer available. Please select another option.';
    }
    
    // Generic fallback
    return 'Something went wrong. Please try again or contact support if the issue persists.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

