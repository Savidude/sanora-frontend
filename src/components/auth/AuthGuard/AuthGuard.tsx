/**
 * AuthGuard Component
 * 
 * Route protection wrapper that enforces authentication
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Loading component displayed while checking authentication
 */
const DefaultFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  }}>
    <div style={{
      textAlign: 'center',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        margin: '0 auto 16px',
        border: '4px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{
        margin: 0,
        fontSize: '1rem',
        color: '#6b7280',
      }}>
        Loading...
      </p>
    </div>
  </div>
);

/**
 * AuthGuard Component
 * 
 * Protects routes by checking authentication state.
 * Redirects unauthenticated users to login page.
 * Preserves intended destination for post-login redirect.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback: Fallback = DefaultFallback,
  redirectTo = '/login',
  requireAuth = true,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ AuthGuard check:', { 
    isAuthenticated, 
    loading, 
    requireAuth,
    path: location.pathname 
  });

  // Show loading state while checking authentication
  if (loading) {
    console.log('⏳ AuthGuard: Showing loading state');
    return <Fallback />;
  }

  // Redirect unauthenticated users to login
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 AuthGuard: Not authenticated, redirecting to login');
    // Save the attempted location for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render protected content for authenticated users
  console.log('✅ AuthGuard: Rendering protected content');
  return <>{children}</>;
};

export default AuthGuard;
