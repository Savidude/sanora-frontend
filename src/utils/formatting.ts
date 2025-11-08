/**
 * Formatting utilities for text and error messages
 */

/**
 * Format timestamp to readable time string
 * @param date - Date object to format
 * @returns Formatted time string (HH:MM)
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Format timestamp to readable date and time string
 * @param date - Date object to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format error message for user display
 * @param error - Error object or string
 * @returns User-friendly error message
 */
export const formatError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Text with first letter capitalized
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format plural text based on count
 * @param count - Number to check
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (optional, adds 's' by default)
 * @returns Formatted string with count and word
 */
export const formatPlural = (
  count: number,
  singular: string,
  plural?: string
): string => {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param text - User input text
 * @returns Sanitized text
 */
export const sanitizeInput = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const formattingUtils = {
  formatTime,
  formatDateTime,
  formatError,
  truncateText,
  capitalizeFirst,
  formatPlural,
  sanitizeInput,
};
