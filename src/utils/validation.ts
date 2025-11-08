/**
 * Validation utilities for user input
 */

const MAX_MESSAGE_LENGTH = 280;
const MIN_MESSAGE_LENGTH = 1;

/**
 * Validate message content
 * @param message - The message content to validate
 * @returns Object with isValid flag and optional error message
 */
export const validateMessage = (
  message: string
): { isValid: boolean; error?: string } => {
  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }
  
  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message must be at least ${MIN_MESSAGE_LENGTH} character`,
    };
  }
  
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less`,
    };
  }
  
  return { isValid: true };
};

/**
 * Check if message exceeds maximum length
 * @param message - The message content to check
 * @returns true if message is too long
 */
export const isMessageTooLong = (message: string): boolean => {
  return message.length > MAX_MESSAGE_LENGTH;
};

/**
 * Get remaining character count
 * @param message - The current message content
 * @returns Number of characters remaining
 */
export const getRemainingChars = (message: string): number => {
  return MAX_MESSAGE_LENGTH - message.length;
};

/**
 * Validate session ID format (UUID v4)
 * @param sessionId - The session ID to validate
 * @returns true if valid UUID format
 */
export const validateSessionId = (sessionId: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
};

/**
 * Generate a new UUID v4 session ID
 * @returns A new UUID string
 */
export const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const validationUtils = {
  validateMessage,
  isMessageTooLong,
  getRemainingChars,
  validateSessionId,
  generateSessionId,
  MAX_MESSAGE_LENGTH,
  MIN_MESSAGE_LENGTH,
};
