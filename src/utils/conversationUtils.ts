import { CONVERSATION_STORAGE_KEY_LIST } from '../types/storage';

/**
 * Error class for conversation-related operations
 */
export class ConversationError extends Error {
  constructor(message: string, public readonly retryable: boolean = true) {
    super(message);
    this.name = 'ConversationError';
  }
}

/**
 * Maximum retry attempts for localStorage operations
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Delay between retry attempts (in milliseconds)
 */
const RETRY_DELAY_MS = 500;

/**
 * Utility functions for managing conversation data and state
 */
export const conversationUtils = {
  /**
   * Checks if localStorage is available
   * @returns true if localStorage is available and working
   */
  isLocalStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Permanently deletes all conversation data from localStorage
   * @throws {ConversationError} If localStorage is unavailable or operation fails after retries
   */
  async clearConversationData(): Promise<void> {
    if (!this.isLocalStorageAvailable()) {
      throw new ConversationError('localStorage is not available', false);
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        // Clear all conversation-related keys
        CONVERSATION_STORAGE_KEY_LIST.forEach(key => {
          localStorage.removeItem(key);
        });

        // Also clear any legacy or additional keys
        const legacyKeys = ['sanora-messages', 'sanora-feedback', 'sanora-session-id'];
        legacyKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        // Verify all keys are removed
        const remainingKeys = CONVERSATION_STORAGE_KEY_LIST.filter(key => 
          localStorage.getItem(key) !== null
        );

        if (remainingKeys.length > 0) {
          throw new Error(`Failed to clear keys: ${remainingKeys.join(', ')}`);
        }

        return; // Success
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < MAX_RETRY_ATTEMPTS) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw new ConversationError(
      `Failed to clear conversation data after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`,
      true
    );
  },

  /**
   * Triggers chat interface reset to initial welcome state
   * This function should be called after conversation data has been cleared
   */
  resetConversationUI(): void {
    // Trigger a page reload to reset the UI to initial state
    // This is the simplest and most reliable way to reset all component state
    window.location.reload();
  },

  /**
   * Handles conversation operation errors
   * Displays user-friendly error message and provides retry option
   * @param error - The error that occurred
   * @param onRetry - Optional callback for retry action
   */
  handleConversationError(error: Error, onRetry?: () => void): {
    message: string;
    canRetry: boolean;
    retry?: () => void;
  } {
    console.error('Conversation error:', error);

    const isConversationError = error instanceof ConversationError;
    const canRetry = isConversationError ? error.retryable : true;

    let message = 'An error occurred while managing your conversation.';

    if (error.message.includes('localStorage')) {
      message = 'Unable to access browser storage. Please check your browser settings.';
    } else if (error.message.includes('clear')) {
      message = 'Failed to clear conversation data. Please try again.';
    }

    return {
      message,
      canRetry,
      retry: canRetry && onRetry ? onRetry : undefined,
    };
  },
};
