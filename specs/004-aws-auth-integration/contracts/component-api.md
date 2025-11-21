# Component API: Authentication Components

**Date**: 20 November 2025  
**Feature**: AWS Authentication Integration

## Component Contracts

### LoginForm Component

**Purpose**: Username/password authentication form with validation and error handling

**Props Interface**:
```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  loading?: boolean
  error?: string | null
  initialUsername?: string
  onForgotPassword?: () => void
  className?: string
}

interface LoginCredentials {
  username: string
  password: string
}
```

**Events**:
- `onSubmit(credentials)` - Fired when form is submitted with valid credentials
- `onForgotPassword()` - Optional callback for forgot password flow

**Behavior**:
- Validates username (email format) and password (min 8 chars) before submission
- Shows loading state during authentication
- Displays error messages with clear, actionable feedback
- Mobile-first responsive design with touch-friendly inputs
- Accessibility compliant with ARIA labels and keyboard navigation

### AuthGuard Component

**Purpose**: Route protection wrapper that enforces authentication

**Props Interface**:
```typescript
interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ComponentType
  redirectTo?: string
  requireAuth?: boolean
}
```

**Behavior**:
- Checks authentication state on mount and route changes
- Redirects unauthenticated users to login page
- Preserves intended destination for post-login redirect
- Displays loading state during authentication check
- Supports optional fallback component for better UX

### SessionManager Component

**Purpose**: Global session state management with automatic token refresh

**Props Interface**:
```typescript
interface SessionManagerProps {
  children: React.ReactNode
  onSessionExpired?: () => void
  refreshThreshold?: number // Minutes before expiry to refresh
  maxRetries?: number
}
```

**Behavior**:
- Monitors token expiration and refreshes automatically
- Handles session persistence across browser restarts
- Provides session context to child components
- Logs out user on refresh failure
- Emits events for session state changes

## Hook Contracts

### useAuth Hook

**Purpose**: Authentication state management and operations

**Interface**:
```typescript
interface UseAuthReturn {
  // State
  user: UserSession | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
  
  // Session info
  isTokenExpiring: boolean
  sessionTimeRemaining: number | null
}
```

**Behavior**:
- Manages authentication state globally
- Persists session across browser restarts
- Automatically refreshes tokens when needed
- Provides loading and error states
- Integrates with AWS Amplify authentication

### useSecureStorage Hook

**Purpose**: Secure token storage with encryption and XSS protection

**Interface**:
```typescript
interface UseSecureStorageReturn {
  setTokens: (tokens: AuthTokens) => void
  getTokens: () => AuthTokens | null
  clearTokens: () => void
  hasValidTokens: () => boolean
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  idToken: string
  expiresAt: number
}
```

**Behavior**:
- Stores refresh tokens securely in localStorage
- Keeps access tokens in memory only
- Validates token format and expiration
- Clears tokens on logout or security events
- Implements XSS protection measures

## Service Contracts

### AuthService

**Purpose**: AWS Cognito integration and authentication operations

**Interface**:
```typescript
class AuthService {
  // Authentication methods
  async signIn(username: string, password: string): Promise<UserSession>
  async signOut(): Promise<void>
  async refreshTokens(): Promise<AuthTokens>
  async getCurrentUser(): Promise<UserSession | null>
  
  // Token management
  async getValidAccessToken(): Promise<string | null>
  isTokenValid(token: string): boolean
  
  // Error handling
  handleAuthError(error: any): string
}
```

**Error Responses**:
```typescript
type AuthError = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_CONFIRMED'
  | 'USER_DISABLED'
  | 'NETWORK_ERROR'
  | 'TOKEN_EXPIRED'
  | 'UNKNOWN_ERROR'
```

### ConfigService

**Purpose**: AWS SSM Parameter Store integration

**Interface**:
```typescript
class ConfigService {
  async loadConfiguration(): Promise<CloudConfiguration[]>
  getParameter(name: string): string | undefined
  isParameterExpired(name: string): boolean
  async refreshParameter(name: string): Promise<void>
  
  // Common parameters
  getApiGatewayUrl(): string
  getCognitoUserPoolId(): string
  getEnvironment(): 'development' | 'staging' | 'production'
}
```

**Parameter Names**:
- `/sanora/api-gateway-url` - API Gateway base URL
- `/sanora/cognito-user-pool-id` - Cognito User Pool ID  
- `/sanora/cognito-client-id` - Cognito App Client ID
- `/sanora/aws-region` - AWS region for services

## API Integration Patterns

### Request Interceptor

**Purpose**: Automatic authorization header injection for API Gateway calls

```typescript
// Axios interceptor configuration
apiClient.interceptors.request.use(async (config) => {
  const token = await authService.getValidAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Error response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await authService.refreshTokens()
      return apiClient.request(error.config)
    }
    return Promise.reject(error)
  }
)
```

### Error Handling Pattern

```typescript
interface ApiErrorResponse {
  message: string
  code: string
  details?: any
  timestamp: string
}

// Standard error handling
const handleApiError = (error: AxiosError): string => {
  if (error.response?.status === 401) {
    return 'Your session has expired. Please log in again.'
  }
  if (error.response?.status === 403) {
    return 'You do not have permission to access this resource.'
  }
  if (error.code === 'NETWORK_ERROR') {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  return 'An unexpected error occurred. Please try again.'
}
```

## Testing Contracts

### Component Testing

```typescript
// LoginForm test interface
interface LoginFormTestUtils {
  renderWithAuth: (props?: Partial<LoginFormProps>) => RenderResult
  fillCredentials: (username: string, password: string) => Promise<void>
  submitForm: () => Promise<void>
  expectError: (message: string) => void
  expectLoading: () => void
}

// AuthGuard test interface  
interface AuthGuardTestUtils {
  renderWithAuthState: (isAuthenticated: boolean) => RenderResult
  expectRedirect: (path: string) => void
  expectChildren: () => void
  expectFallback: () => void
}
```

### E2E Testing Patterns

```typescript
// Authentication flow test
interface AuthFlowTest {
  visitLoginPage: () => Promise<void>
  enterCredentials: (username: string, password: string) => Promise<void>
  submitLogin: () => Promise<void>
  expectDashboard: () => Promise<void>
  logout: () => Promise<void>
  expectLoginPage: () => Promise<void>
}

// Protected route test
interface ProtectedRouteTest {
  visitProtectedRoute: (path: string) => Promise<void>
  expectLoginRedirect: () => Promise<void>
  authenticateUser: () => Promise<void>
  expectOriginalDestination: () => Promise<void>
}
```