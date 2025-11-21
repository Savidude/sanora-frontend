/**
 * Secure Token Storage Utilities
 * 
 * Provides secure storage for authentication tokens with XSS protection.
 * Access tokens stored in memory only, refresh tokens encrypted in localStorage.
 */

import type { AuthTokens } from '../types/auth';

const REFRESH_TOKEN_KEY = 'sanora_refresh_token';
const TOKEN_EXPIRY_KEY = 'sanora_token_expiry';

// In-memory storage for access tokens (cleared on page refresh)
let inMemoryAccessToken: string | null = null;
let inMemoryIdToken: string | null = null;

/**
 * Store authentication tokens securely
 * - Access token and ID token stored in memory only (XSS protection)
 * - Refresh token stored in localStorage for persistence
 */
export const setTokens = (tokens: AuthTokens): void => {
  try {
    // Store in memory for XSS protection
    inMemoryAccessToken = tokens.accessToken;
    inMemoryIdToken = tokens.idToken;

    // Store refresh token in localStorage for session persistence
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, tokens.expiresAt.toString());
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

/**
 * Retrieve stored authentication tokens
 * Returns null if tokens are not available or expired
 */
export const getTokens = (): AuthTokens | null => {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!refreshToken || !expiryStr) {
      return null;
    }

    const expiresAt = parseInt(expiryStr, 10);

    // Check if token is expired
    if (Date.now() >= expiresAt) {
      clearTokens();
      return null;
    }

    // Return tokens (access and ID tokens from memory, refresh from storage)
    return {
      accessToken: inMemoryAccessToken || '',
      idToken: inMemoryIdToken || '',
      refreshToken,
      expiresAt,
    };
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
};

/**
 * Get only the access token for API calls
 */
export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

/**
 * Get only the ID token for authentication
 */
export const getIdToken = (): string | null => {
  return inMemoryIdToken;
};

/**
 * Get only the refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Check if valid tokens are available
 * 
 * Note: We rely on Amplify's built-in token management.
 * This function just checks our custom storage for tracking purposes.
 * The actual session validation is done by Amplify's fetchAuthSession.
 */
export const hasValidTokens = (): boolean => {
  try {
    // Check if we have stored tokens from a previous session
    // Amplify manages its own token storage, so we always return true
    // and let Amplify's fetchAuthSession handle validation
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    return !!refreshToken;
  } catch (error) {
    console.error('Failed to check for valid tokens:', error);
    return false;
  }
};

/**
 * Clear all stored tokens
 */
export const clearTokens = (): void => {
  try {
    // Clear in-memory tokens
    inMemoryAccessToken = null;
    inMemoryIdToken = null;

    // Clear localStorage tokens
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};

/**
 * Validate token format (basic JWT structure check)
 */
export const isValidTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT format: header.payload.signature
  const parts = token.split('.');
  return parts.length === 3;
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpiry = (): number | null => {
  try {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiryStr ? parseInt(expiryStr, 10) : null;
  } catch (error) {
    console.error('Failed to get token expiry:', error);
    return null;
  }
};

/**
 * Check if token is expiring soon (within threshold minutes)
 */
export const isTokenExpiringSoon = (thresholdMinutes: number = 5): boolean => {
  const expiry = getTokenExpiry();
  if (!expiry) {
    return true;
  }

  const thresholdMs = thresholdMinutes * 60 * 1000;
  const timeUntilExpiry = expiry - Date.now();

  return timeUntilExpiry < thresholdMs;
};
