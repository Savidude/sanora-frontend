/**
 * AWS Cognito Authentication Service
 * 
 * Handles authentication operations with AWS Cognito using Amplify
 */

import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  AuthError as AmplifyAuthError,
} from 'aws-amplify/auth';
import type {
  UserSession,
  AuthTokens,
  LoginCredentials,
  AuthErrorDetails,
} from '../types/auth';
import * as tokenStorage from '../utils/tokenStorage';

/**
 * Sign in user with username and password
 */
export const signInUser = async (
  credentials: LoginCredentials
): Promise<UserSession> => {
  try {
    logSecurityEvent('LOGIN_ATTEMPT', {
      username: credentials.username,
    }, 'INFO');

    const { isSignedIn } = await signIn({
      username: credentials.username,
      password: credentials.password,
    });

    if (!isSignedIn) {
      throw new Error('Sign in failed');
    }

    // Get current user session
    const session = await getCurrentUserSession();
    
    logSecurityEvent('LOGIN_SUCCESS', {
      userId: session.userId,
      username: session.username,
    }, 'INFO');

    return session;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    logSecurityEvent('LOGOUT_ATTEMPT', {}, 'INFO');
    
    await signOut();
    tokenStorage.clearTokens();
    
    logSecurityEvent('LOGOUT_SUCCESS', {}, 'INFO');
  } catch (error) {
    console.error('Sign out error:', error);
    // Clear tokens even if sign out fails
    tokenStorage.clearTokens();
    
    logSecurityEvent('LOGOUT_ERROR', {
      error: error instanceof Error ? error.message : String(error),
    }, 'WARNING');
    
    throw handleAuthError(error);
  }
};

/**
 * Get current user session
 */
export const getCurrentUserSession = async (): Promise<UserSession> => {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();

    if (!session.tokens) {
      throw new Error('No authentication tokens available');
    }

    const { accessToken, idToken } = session.tokens;

    if (!idToken) {
      throw new Error('No ID token available');
    }

    // Parse token expiry from access token
    const tokenExpiry = new Date(
      (accessToken.payload.exp || 0) * 1000
    );

    // Store tokens securely
    const tokens: AuthTokens = {
      accessToken: accessToken.toString(),
      idToken: idToken.toString(),
      refreshToken: tokenStorage.getRefreshToken() || '',
      expiresAt: tokenExpiry.getTime(),
    };
    tokenStorage.setTokens(tokens);

    // Create user session
    const userSession: UserSession = {
      userId: user.userId,
      username: user.username,
      email: idToken.payload.email as string || '',
      accessToken: accessToken.toString(),
      refreshToken: tokenStorage.getRefreshToken() || '',
      idToken: idToken.toString(),
      tokenExpiry,
      sessionCreated: new Date(),
      lastActivity: new Date(),
      isAuthenticated: true,
    };

    return userSession;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Refresh authentication tokens
 */
export const refreshTokens = async (): Promise<AuthTokens> => {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });

    if (!session.tokens) {
      throw new Error('Failed to refresh tokens');
    }

    const { accessToken, idToken } = session.tokens;

    if (!accessToken || !idToken) {
      throw new Error('Invalid tokens received');
    }

    const tokenExpiry = new Date((accessToken.payload.exp || 0) * 1000);

    const tokens: AuthTokens = {
      accessToken: accessToken.toString(),
      idToken: idToken.toString(),
      refreshToken: tokenStorage.getRefreshToken() || '',
      expiresAt: tokenExpiry.getTime(),
    };

    tokenStorage.setTokens(tokens);
    return tokens;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Get valid access token (refreshes if needed)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    // Check if token is expiring soon
    if (tokenStorage.isTokenExpiringSoon()) {
      await refreshTokens();
    }

    const token = tokenStorage.getAccessToken();
    if (token && tokenStorage.isValidTokenFormat(token)) {
      return token;
    }

    return null;
  } catch (error) {
    console.error('Failed to get valid access token:', error);
    return null;
  }
};

/**
 * Get valid ID token for API authentication (refreshes if needed)
 */
export const getValidIdToken = async (): Promise<string | null> => {
  try {
    // Check if token is expiring soon
    if (tokenStorage.isTokenExpiringSoon()) {
      await refreshTokens();
    }

    const token = tokenStorage.getIdToken();
    if (token && tokenStorage.isValidTokenFormat(token)) {
      return token;
    }

    return null;
  } catch (error) {
    console.error('Failed to get valid ID token:', error);
    return null;
  }
};

/**
 * Check if token is valid
 */
export const isTokenValid = (token: string): boolean => {
  if (!tokenStorage.isValidTokenFormat(token)) {
    return false;
  }

  // Additional validation can be added here
  return true;
};

/**
 * Log security event for monitoring and audit
 */
const logSecurityEvent = (
  eventType: string,
  details: Record<string, any>,
  severity: 'INFO' | 'WARNING' | 'ERROR' = 'INFO'
) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    severity,
    ...details,
  };

  // Log to console with appropriate level
  if (severity === 'ERROR') {
    console.error('[SECURITY]', logEntry);
  } else if (severity === 'WARNING') {
    console.warn('[SECURITY]', logEntry);
  } else {
    console.log('[SECURITY]', logEntry);
  }

  // In production, this could send to a logging service
  // Example: sendToLoggingService(logEntry);
};

/**
 * Handle authentication errors and convert to user-friendly messages
 */
export const handleAuthError = (error: unknown): AuthErrorDetails => {
  console.error('Authentication error:', error);

  if (error instanceof Error) {
    const amplifyError = error as AmplifyAuthError;

    // Map Amplify error codes to our error types
    if (amplifyError.name === 'NotAuthorizedException') {
      logSecurityEvent('LOGIN_FAILED', {
        reason: 'Invalid credentials',
        errorName: amplifyError.name,
      }, 'WARNING');

      return {
        type: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password. Please try again.',
        originalError: error,
      };
    }

    if (amplifyError.name === 'UserNotConfirmedException') {
      logSecurityEvent('LOGIN_BLOCKED', {
        reason: 'User not confirmed',
        errorName: amplifyError.name,
      }, 'WARNING');

      return {
        type: 'USER_NOT_CONFIRMED',
        message: 'Your account has not been confirmed. Please check your email.',
        originalError: error,
      };
    }

    if (amplifyError.name === 'UserDisabledException') {
      logSecurityEvent('LOGIN_BLOCKED', {
        reason: 'User account disabled',
        errorName: amplifyError.name,
      }, 'ERROR');

      return {
        type: 'USER_DISABLED',
        message: 'Your account has been disabled. Please contact support.',
        originalError: error,
      };
    }

    if (amplifyError.name === 'NetworkError') {
      logSecurityEvent('NETWORK_ERROR', {
        reason: 'Network connectivity issue',
        errorName: amplifyError.name,
      }, 'WARNING');

      return {
        type: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        originalError: error,
      };
    }

    if (amplifyError.message?.includes('expired')) {
      logSecurityEvent('TOKEN_EXPIRED', {
        reason: 'Session token expired',
      }, 'INFO');

      return {
        type: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again.',
        originalError: error,
      };
    }
  }

  logSecurityEvent('AUTH_ERROR', {
    reason: 'Unknown authentication error',
    error: error instanceof Error ? error.message : String(error),
  }, 'ERROR');

  return {
    type: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    originalError: error,
  };
};
