/**
 * Date formatting utilities for displaying dates in IST (Asia/Kolkata) timezone
 * Falls back to user's local timezone if IST is not available
 */

/**
 * Format a date string or Date object to IST timezone
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in IST
 */
export function formatDateIST(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    // Try to format in IST (Asia/Kolkata)
    return new Intl.DateTimeFormat('en-IN', {
      ...options,
      timeZone: 'Asia/Kolkata',
    }).format(dateObj);
  } catch (error) {
    // Fallback to user's local timezone if IST is not available
    console.warn('Failed to format date in IST, using local timezone:', error);
    return new Intl.DateTimeFormat('en-IN', options).format(dateObj);
  }
}

/**
 * Format a date for display in the dashboard table
 * Format: "Nov 8, 2025, 10:48 PM" (IST)
 */
export function formatDateForTable(date: string | Date): string {
  return formatDateIST(date, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date for chart display (short format)
 * Format: "Nov 8"
 */
export function formatDateForChart(date: string | Date): string {
  return formatDateIST(date, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get the current timezone being used (for display purposes)
 */
export function getCurrentTimezone(): string {
  try {
    // Check if we can use IST
    const testDate = new Date();
    const istDate = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
    }).format(testDate);
    return 'IST (Asia/Kolkata)';
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

