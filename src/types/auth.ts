/**
 * Authentication Data Types
 * 
 * TypeScript interfaces for AWS Cognito authentication and session management
 */

/**
 * User session state throughout the application lifecycle
 */
export interface UserSession {
  /** Unique identifier from AWS Cognito user pool */
  userId: string;
  /** User's login identifier (email or username) */
  username: string;
  /** User's email address from Cognito attributes */
  email: string;
  /** JWT access token for API authorization */
  accessToken: string;
  /** Long-lived token for session renewal */
  refreshToken: string;
  /** JWT identity token containing user claims */
  idToken: string;
  /** Access token expiration timestamp */
  tokenExpiry: Date;
  /** When the session was established */
  sessionCreated: Date;
  /** Last user interaction timestamp */
  lastActivity: Date;
  /** Current authentication state */
  isAuthenticated: boolean;
}

/**
 * Authentication tokens from AWS Cognito
 */
export interface AuthTokens {
  /** JWT access token for API authorization */
  accessToken: string;
  /** Long-lived token for session renewal */
  refreshToken: string;
  /** JWT identity token containing user claims */
  idToken: string;
  /** Token expiration timestamp (Unix time in milliseconds) */
  expiresAt: number;
}

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  /** Username or email address */
  username: string;
  /** User's password */
  password: string;
}

/**
 * Authentication error types
 */
export type AuthError =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_CONFIRMED'
  | 'USER_DISABLED'
  | 'NETWORK_ERROR'
  | 'TOKEN_EXPIRED'
  | 'UNKNOWN_ERROR';

/**
 * Authentication error with details
 */
export interface AuthErrorDetails {
  /** Error type */
  type: AuthError;
  /** Human-readable error message */
  message: string;
  /** Original error object */
  originalError?: unknown;
}

/**
 * Session state types
 */
export type SessionState =
  | 'UNAUTHENTICATED'
  | 'AUTHENTICATING'
  | 'AUTHENTICATED'
  | 'TOKEN_REFRESHING'
  | 'EXPIRED';

/**
 * Session information for validation
 */
export interface SessionInfo {
  /** Unique user identifier from Cognito */
  userId: string;
  /** User's login identifier */
  username: string;
  /** User's email address */
  email: string;
  /** When the current token expires */
  tokenExpiry: string;
  /** Whether the session is currently valid */
  isValid: boolean;
  /** Timestamp of last user activity */
  lastActivity?: string;
}

/**
 * Token refresh request
 */
export interface RefreshTokenRequest {
  /** Valid refresh token for the user */
  refreshToken: string;
  /** Optional device information for security logging */
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
  };
}

/**
 * Token refresh response
 */
export interface TokenResponse {
  /** New JWT access token */
  accessToken: string;
  /** New JWT ID token */
  idToken: string;
  /** Token expiry time in seconds */
  expiresIn: number;
  /** Token type (always Bearer) */
  tokenType: string;
}

/**
 * User profile information
 */
export interface UserProfile {
  /** Unique user identifier */
  userId: string;
  /** User's email address */
  email: string;
  /** User's display name */
  username: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User preferences for learning */
  preferences?: UserPreferences;
  /** When the user account was created */
  createdAt: string;
  /** When the profile was last updated */
  updatedAt: string;
}

/**
 * User learning preferences
 */
export interface UserPreferences {
  /** Target language for learning */
  language?: string;
  /** Learning difficulty level */
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  /** Whether notifications are enabled */
  notificationsEnabled?: boolean;
}
