# Quickstart: AWS Authentication Integration

**Date**: 20 November 2025  
**Feature**: AWS Authentication Integration  
**Branch**: 004-aws-auth-integration  

## Prerequisites

- Node.js 18+ with npm
- AWS CLI configured with appropriate permissions
- AWS Amplify Gen 2 CLI installed
- Access to AWS account with Cognito and SSM permissions

## Installation & Setup

### 1. Install Dependencies

```bash
# Install AWS Amplify dependencies
npm install aws-amplify @aws-amplify/ui-react @aws-sdk/client-ssm

# Install development dependencies
npm install --save-dev @aws-amplify/backend @aws-amplify/backend-cli
npm install --save-dev @playwright/test dotenv
```

### 2. Initialize Amplify Backend

```bash
# Initialize Amplify Gen 2 project
npx ampx configure profile
npx ampx init

# Create authentication resource
mkdir -p amplify/auth
```

Create `amplify/auth/resource.ts`:
```typescript
import { defineAuth } from '@aws-amplify/backend'

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
    },
  },
})
```

Create `amplify/backend.ts`:
```typescript
import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource.js'

const backend = defineBackend({
  auth,
})

// Add SSM permissions to authenticated users
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy({
  Effect: 'Allow',
  Action: ['ssm:GetParameter', 'ssm:GetParameters'],
  Resource: 'arn:aws:ssm:*:*:parameter/sanora/*'
})
```

### 3. Configure Application

Update `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import App from './App.tsx'
import './styles/globals.css'

Amplify.configure(outputs)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 4. Set Up Environment Variables

Create `.env.local`:
```bash
# AWS Configuration
REACT_APP_AWS_REGION=us-east-1

# SSM Parameter Names
REACT_APP_SSM_API_GATEWAY_URL=/sanora/api-gateway-url
REACT_APP_SSM_COGNITO_USER_POOL_ID=/sanora/cognito-user-pool-id
REACT_APP_SSM_COGNITO_CLIENT_ID=/sanora/cognito-client-id

# Environment
REACT_APP_ENVIRONMENT=development
```

## Basic Implementation

### 1. Create Authentication Hook

Create `src/hooks/useAuth.ts`:
```typescript
import { useState, useEffect, createContext, useContext } from 'react'
import { getCurrentUser, signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'

interface AuthContextType {
  user: any | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      await signIn({ username, password })
      await checkAuthState()
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 2. Create Login Component

Create `src/components/auth/LoginForm/LoginForm.tsx`:
```typescript
import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import styles from './LoginForm.module.css'

const LoginForm: React.FC = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(username, password)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h2>Sign In</h2>
      
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      
      <div className={styles.field}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          autoComplete="username"
        />
      </div>
      
      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="current-password"
        />
      </div>
      
      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  )
}

export default LoginForm
```

### 3. Create Route Protection

Create `src/components/auth/AuthGuard/AuthGuard.tsx`:
```typescript
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import LoadingIndicator from '../../ui/LoadingIndicator/LoadingIndicator'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingIndicator />
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default AuthGuard
```

### 4. Update App Router

Update `src/App.tsx`:
```typescript
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import AuthGuard from './components/auth/AuthGuard/AuthGuard'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <AuthGuard>
                <ChatPage />
              </AuthGuard>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <AuthGuard>
                <ChatPage />
              </AuthGuard>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
```

## API Integration

### Create Authenticated API Client

Create `src/services/api.ts`:
```typescript
import axios from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'

const apiClient = axios.create({
  timeout: 10000,
})

// Request interceptor to add auth headers
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.error('Failed to get auth session:', error)
  }
  
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

## Deployment

### 1. Deploy Backend

```bash
# Deploy Amplify backend
npx ampx sandbox

# For production deployment
npx ampx deploy --branch main
```

### 2. Configure SSM Parameters

```bash
# Set up SSM parameters (replace with actual values)
aws ssm put-parameter \
  --name "/sanora/api-gateway-url" \
  --value "https://api.yourdomain.com" \
  --type "String" \
  --overwrite

aws ssm put-parameter \
  --name "/sanora/cognito-user-pool-id" \
  --value "us-east-1_XXXXXXXXX" \
  --type "String" \
  --overwrite

aws ssm put-parameter \
  --name "/sanora/cognito-client-id" \
  --value "your-client-id" \
  --type "String" \
  --overwrite
```

### 3. Frontend Deployment

```bash
# Build for production
npm run build

# Deploy with Amplify Hosting
npx ampx deploy --branch main
```

## Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests (ensure test environment is configured)
npm run test:e2e
```

### Test User Creation

```bash
# Create test user via AWS CLI
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username testuser@example.com \
  --temporary-password TempPass123! \
  --message-action SUPPRESS
```

## Troubleshooting

### Common Issues

1. **Amplify configuration not found**
   - Run `npx ampx sandbox` to generate `amplify_outputs.json`

2. **SSM permissions denied**
   - Ensure IAM role has SSM read permissions for `/sanora/*` parameters

3. **CORS errors in development**
   - Configure API Gateway CORS settings
   - Check Amplify backend CORS configuration

4. **Token refresh failures**
   - Verify refresh token storage is working
   - Check token expiration settings in Cognito

### Debug Mode

Enable detailed logging:
```typescript
import { Amplify } from 'aws-amplify'

Amplify.configure(outputs, {
  ssr: false,
  logging: {
    level: 'DEBUG',
  },
})
```

## Next Steps

1. Implement password reset functionality
2. Add multi-factor authentication (MFA)
3. Set up user profile management
4. Configure session timeout policies
5. Add security event logging
6. Implement social sign-in providers

For detailed implementation guidance, see:
- [data-model.md](./data-model.md) - Entity relationships and validation
- [contracts/component-api.md](./contracts/component-api.md) - Component interfaces
- [contracts/api.yaml](./contracts/api.yaml) - API Gateway specification