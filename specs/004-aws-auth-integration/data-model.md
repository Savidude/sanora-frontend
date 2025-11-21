# Data Model: AWS Authentication Integration

**Date**: 20 November 2025  
**Feature**: AWS Authentication Integration  
**Branch**: 004-aws-auth-integration

## Core Entities

### User Session
Represents an authenticated user's session state throughout the application lifecycle.

**Fields**:
- `userId`: string - Unique identifier from AWS Cognito user pool
- `username`: string - User's login identifier (email or username)
- `email`: string - User's email address from Cognito attributes
- `accessToken`: string - JWT access token for API authorization
- `refreshToken`: string - Long-lived token for session renewal
- `idToken`: string - JWT identity token containing user claims
- `tokenExpiry`: Date - Access token expiration timestamp
- `sessionCreated`: Date - When the session was established
- `lastActivity`: Date - Last user interaction timestamp
- `isAuthenticated`: boolean - Current authentication state

**Relationships**:
- Has many API requests (1:N)
- Linked to cloud configuration (N:1)

**Validation Rules**:
- `userId` must be valid Cognito UUID format
- `email` must be valid email format matching Cognito user pool requirements
- `accessToken` must be valid JWT format
- `tokenExpiry` must be future date for active sessions
- `sessionCreated` cannot be future date

**State Transitions**:
```
UNAUTHENTICATED → AUTHENTICATING → AUTHENTICATED
AUTHENTICATED → TOKEN_REFRESHING → AUTHENTICATED
AUTHENTICATED → EXPIRED → UNAUTHENTICATED
AUTHENTICATED → LOGOUT → UNAUTHENTICATED
```

### API Request
Represents outbound HTTP requests to AWS API Gateway with authentication context.

**Fields**:
- `requestId`: string - Unique request identifier for tracking
- `method`: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' - HTTP method
- `endpoint`: string - API Gateway endpoint URL
- `headers`: Record<string, string> - HTTP headers including authorization
- `payload`: any - Request body data
- `timestamp`: Date - When request was initiated
- `userId`: string - Associated user session identifier
- `retryCount`: number - Number of retry attempts
- `status`: 'pending' | 'success' | 'error' | 'timeout' - Request status
- `responseTime`: number - Response time in milliseconds

**Relationships**:
- Belongs to user session (N:1)
- Uses cloud configuration (N:1)

**Validation Rules**:
- `endpoint` must be valid URL format
- `method` must be supported HTTP method
- `headers` must include 'Authorization' for authenticated requests
- `timestamp` cannot be future date
- `retryCount` must be non-negative integer ≤ 3
- `responseTime` must be positive number

**State Transitions**:
```
PENDING → SUCCESS
PENDING → ERROR → RETRY → PENDING
PENDING → TIMEOUT → RETRY → PENDING
ERROR/TIMEOUT → FAILED (after max retries)
```

### Cloud Configuration
Represents application parameters retrieved from AWS SSM Parameter Store.

**Fields**:
- `parameterName`: string - SSM parameter name (e.g., '/sanora/api-gateway-url')
- `value`: string - Parameter value
- `version`: number - Parameter version number
- `lastUpdated`: Date - When parameter was last modified in SSM
- `retrieved`: Date - When value was fetched from SSM
- `encrypted`: boolean - Whether parameter is encrypted in SSM
- `environment`: 'development' | 'staging' | 'production' - Target environment
- `ttl`: number - Time-to-live in seconds for local caching

**Relationships**:
- Used by API requests (1:N)
- Associated with user sessions (1:N)

**Validation Rules**:
- `parameterName` must follow SSM naming convention (/namespace/key)
- `value` cannot be empty string
- `version` must be positive integer
- `lastUpdated` cannot be future date
- `ttl` must be positive number ≥ 300 seconds (5 minutes)
- `environment` must match allowed environment values

**State Transitions**:
```
LOADING → LOADED
LOADING → ERROR
LOADED → REFRESHING → LOADED
LOADED → EXPIRED → LOADING
```

## Entity Relationships

```
UserSession (1) ←→ (N) APIRequest
UserSession (N) ←→ (1) CloudConfiguration
APIRequest (N) ←→ (1) CloudConfiguration
```

## Data Flow Patterns

### Authentication Flow
1. User provides credentials
2. System creates `UserSession` with tokens from Cognito
3. Session persists to secure storage with refresh token
4. API requests use session tokens for authorization

### API Communication Flow
1. User action triggers API call
2. System creates `APIRequest` with authentication headers
3. Request uses `CloudConfiguration` for endpoint URLs
4. Response updates session activity timestamp

### Configuration Management Flow
1. Application startup loads `CloudConfiguration` from SSM
2. Parameters cached locally with TTL
3. Expired parameters trigger refresh from SSM
4. Configuration updates propagate to active sessions

## Security Considerations

### Token Security
- Access tokens stored in memory only (not persisted)
- Refresh tokens encrypted in localStorage
- Session data cleared on logout/expiration
- Token validation before each API call

### Data Protection
- SSM parameters encrypted at rest and in transit
- No sensitive data logged in application state
- User credentials never stored locally
- Session timeout after inactivity period

### Error Handling
- Authentication failures logged without sensitive details
- Network errors handled gracefully with retry logic
- Session expiration triggers automatic re-authentication
- Configuration failures degrade gracefully with user notification

## TypeScript Interfaces

```typescript
interface UserSession {
  userId: string
  username: string
  email: string
  accessToken: string
  refreshToken: string
  idToken: string
  tokenExpiry: Date
  sessionCreated: Date
  lastActivity: Date
  isAuthenticated: boolean
}

interface APIRequest {
  requestId: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  headers: Record<string, string>
  payload?: any
  timestamp: Date
  userId: string
  retryCount: number
  status: 'pending' | 'success' | 'error' | 'timeout'
  responseTime?: number
}

interface CloudConfiguration {
  parameterName: string
  value: string
  version: number
  lastUpdated: Date
  retrieved: Date
  encrypted: boolean
  environment: 'development' | 'staging' | 'production'
  ttl: number
}
```