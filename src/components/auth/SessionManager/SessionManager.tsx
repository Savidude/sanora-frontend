/**
 * SessionManager Component
 * 
 * Global session state management with automatic token refresh
 * and activity tracking
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export interface SessionManagerProps {
  children: React.ReactNode;
  onSessionExpired?: () => void;
  refreshThreshold?: number; // Minutes before expiry to refresh
  maxRetries?: number;
  activityTimeout?: number; // Minutes of inactivity before considering session inactive
}

const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  onSessionExpired,
  refreshThreshold = 5,
  maxRetries = 3,
  activityTimeout = 30,
}) => {
  const { refreshSession, logout, sessionState, sessionTimeRemaining } = useAuth();
  const retryCountRef = useRef(0);
  const lastActivityRef = useRef(Date.now());

  /**
   * Handle session expiration
   */
  const handleExpiredSession = useCallback(async () => {
    console.warn('Session expired');
    
    if (onSessionExpired) {
      onSessionExpired();
    }
    
    // Log out user
    await logout();
  }, [logout, onSessionExpired]);

  /**
   * Attempt to refresh session with retry logic
   */
  const attemptRefresh = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      console.error('Max refresh retries reached');
      await handleExpiredSession();
      return;
    }

    try {
      retryCountRef.current += 1;
      await refreshSession();
      // Reset retry count on success
      retryCountRef.current = 0;
    } catch (error) {
      console.error('Session refresh failed:', error);
      
      if (retryCountRef.current >= maxRetries) {
        await handleExpiredSession();
      }
    }
  }, [refreshSession, maxRetries, handleExpiredSession]);

  /**
   * Track user activity
   */
  const trackActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * Set up activity listeners
   */
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach((event) => {
      document.addEventListener(event, trackActivity);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, [trackActivity]);

  /**
   * Monitor session state and trigger refresh when needed
   */
  useEffect(() => {
    // Check if session is expired
    if (sessionState === 'EXPIRED') {
      handleExpiredSession();
      return;
    }

    // Don't set up monitoring if not authenticated
    if (sessionState !== 'AUTHENTICATED') {
      return;
    }

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const activityTimeoutMs = activityTimeout * 60 * 1000;

      // Check for inactivity
      if (timeSinceActivity > activityTimeoutMs) {
        console.log('User inactive - session will expire naturally');
        return;
      }

      // Check if token is expiring soon
      if (sessionTimeRemaining !== null) {
        const thresholdMs = refreshThreshold * 60 * 1000;
        
        if (sessionTimeRemaining < thresholdMs && sessionTimeRemaining > 0) {
          console.log('Token expiring soon, refreshing...');
          attemptRefresh();
        } else if (sessionTimeRemaining <= 0) {
          console.log('Token expired');
          handleExpiredSession();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [
    sessionState,
    sessionTimeRemaining,
    refreshThreshold,
    activityTimeout,
    attemptRefresh,
    handleExpiredSession,
  ]);

  return <>{children}</>;
};

export default SessionManager;
