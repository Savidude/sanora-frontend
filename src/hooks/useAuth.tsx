/**
 * Authentication Context and Hook
 * 
 * Provides global authentication state management and operations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserSession, LoginCredentials, SessionState } from '../types/auth';
import * as authService from '../services/auth';
import * as tokenStorage from '../utils/tokenStorage';

/**
 * Authentication context value
 */
interface AuthContextValue {
  // State
  user: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionState: SessionState;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  
  // Session info
  isTokenExpiring: boolean;
  sessionTimeRemaining: number | null;
}

// Create context
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('UNAUTHENTICATED');
  const hasCheckedAuthRef = React.useRef(false);

  /**
   * Check authentication state on mount
   */
  const checkAuthState = useCallback(async () => {
    console.log('🔍 checkAuthState: Starting auth state check');
    try {
      setLoading(true);
      
      // Try to get current session from Amplify
      // Amplify manages its own token storage and will auto-refresh if needed
      console.log('🔍 checkAuthState: Attempting to get current user session from Amplify');
      const session = await authService.getCurrentUserSession();
      console.log('🔍 checkAuthState: Got session for user:', session.username);
      setUser(session);
      setSessionState('AUTHENTICATED');
    } catch (error) {
      console.log('🔍 checkAuthState: No valid session found:', error);
      // No valid session - user needs to log in
      setUser(null);
      setSessionState('UNAUTHENTICATED');
      tokenStorage.clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      setSessionState('AUTHENTICATING');

      const session = await authService.signInUser(credentials);
      setUser(session);
      setSessionState('AUTHENTICATED');
      console.log('✓ Login successful, user authenticated:', session.username);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to log in';
      setError(errorMessage);
      setSessionState('UNAUTHENTICATED');
      console.error('✗ Login failed:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signOutUser();
      setUser(null);
      setSessionState('UNAUTHENTICATED');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout fails
      setUser(null);
      setSessionState('UNAUTHENTICATED');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user session
   */
  const refreshSession = useCallback(async () => {
    try {
      setSessionState('TOKEN_REFRESHING');
      await authService.refreshTokens();
      
      // Get updated session
      const session = await authService.getCurrentUserSession();
      setUser(session);
      setSessionState('AUTHENTICATED');
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setSessionState('EXPIRED');
      setUser(null);
      throw error;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if token is expiring soon
   */
  const isTokenExpiring = tokenStorage.isTokenExpiringSoon();

  /**
   * Get session time remaining in milliseconds
   */
  const sessionTimeRemaining = (() => {
    const expiry = tokenStorage.getTokenExpiry();
    if (!expiry) return null;
    const remaining = expiry - Date.now();
    return remaining > 0 ? remaining : 0;
  })();

  /**
   * Check auth state on mount and set up token refresh interval
   */
  useEffect(() => {
    // Only check auth state once on initial mount
    if (!hasCheckedAuthRef.current) {
      console.log('🔄 Initial mount: checking auth state');
      hasCheckedAuthRef.current = true;
      checkAuthState();
    }

    // Set up interval to check for token expiration
    const interval = setInterval(() => {
      if (tokenStorage.isTokenExpiringSoon() && user) {
        refreshSession().catch((error) => {
          console.error('Auto-refresh failed:', error);
          // Session expired, user needs to log in again
          setSessionState('EXPIRED');
        });
      }
    }, 60000); // Check every minute

    // Clean up session on beforeunload (app termination)
    const handleBeforeUnload = () => {
      // Update last activity timestamp before closing
      if (user) {
        console.log('App closing - session will persist for next visit');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [checkAuthState, user, refreshSession, sessionState]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user && sessionState === 'AUTHENTICATED',
    loading,
    error,
    sessionState,
    login,
    logout,
    refreshSession,
    clearError,
    isTokenExpiring,
    sessionTimeRemaining,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * 
 * Access authentication context from any component
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};
