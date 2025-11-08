/**
 * Type definitions and constants for localStorage management
 */

/**
 * Conversation-related storage keys used in the application
 */
export const CONVERSATION_STORAGE_KEYS = {
  /** Main conversation messages array */
  CONVERSATION_MESSAGES: 'sanora_conversation_messages',
  
  /** Conversation metadata and state */
  CONVERSATION_STATE: 'sanora_conversation_state',
  
  /** User preferences related to conversation */
  CONVERSATION_PREFERENCES: 'sanora_conversation_prefs',
  
  /** Temporary conversation data (drafts, pending actions, etc.) */
  CONVERSATION_TEMP: 'sanora_conversation_temp',
} as const;

/**
 * Type for conversation storage keys
 */
export type ConversationStorageKey = typeof CONVERSATION_STORAGE_KEYS[keyof typeof CONVERSATION_STORAGE_KEYS];

/**
 * Array of all conversation storage keys for batch operations
 */
export const CONVERSATION_STORAGE_KEY_LIST: ConversationStorageKey[] = Object.values(CONVERSATION_STORAGE_KEYS);
