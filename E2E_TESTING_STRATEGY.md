# E2E Testing Strategy for React TypeScript + AWS Cognito

## 🎯 Overview

This document provides a comprehensive end-to-end testing strategy for a React TypeScript application with AWS Cognito authentication, optimized for mobile-first responsive design and AWS Amplify deployment.

## 🏗️ Recommended Architecture

### **Framework Choice: Playwright** ✅

**Why Playwright over Cypress:**

1. **Superior Mobile Testing**: Better mobile viewport emulation and touch event handling
2. **AWS Cognito Compatibility**: More reliable cross-origin authentication flows
3. **Multi-browser Support**: Chromium, Firefox, and Safari testing out-of-the-box
4. **CI/CD Integration**: Faster execution and better AWS Amplify integration
5. **Modern Architecture**: Built for modern web apps with better async handling

### **Testing Layer Architecture**

```
┌─────────────────────────────────────────────┐
│                E2E Tests                    │
│  ┌─────────────┬─────────────┬─────────────┐│
│  │   Auth      │     API     │  Responsive ││
│  │   Flows     │   Testing   │   Testing   ││
│  └─────────────┴─────────────┴─────────────┘│
├─────────────────────────────────────────────┤
│              Integration Tests               │
├─────────────────────────────────────────────┤
│                Unit Tests                   │
│            (Jest + RTL)                     │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test @aws-sdk/client-cognito-identity-provider dotenv
```

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env.test

# Fill in your test Cognito configuration
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
VITE_API_BASE_URL=https://your-test-api.amazonaws.com/test
```

### 3. Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (development)
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Run mobile tests only
npx playwright test --grep="Mobile"
```

## 🔐 Authentication Testing Patterns

### **1. Programmatic Authentication (Recommended)**

```typescript
// Fast, reliable authentication bypass for test setup
const tokens = await authUtils.authenticateUser(username, password);
const localStorage = authUtils.createAuthLocalStorage(tokens, user);

await context.addInitScript((storage) => {
  for (const [key, value] of Object.entries(storage)) {
    window.localStorage.setItem(key, value);
  }
}, localStorage);
```

### **2. UI-Based Authentication (When Needed)**

```typescript
// Test the actual login UI flow
test('should login via UI', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="username"]', username);
  await page.fill('[data-testid="password"]', password);
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/');
});
```

### **3. Session State Testing**

```typescript
// Test authentication persistence
test('should maintain session across refreshes', async ({ authenticatedPage }) => {
  await authenticatedPage.reload();
  await expect(authenticatedPage.locator('[data-testid="chat-interface"]')).toBeVisible();
});
```

## 🌐 API Authentication Testing

### **Request Interception Pattern**

```typescript
test('should include auth headers', async ({ authenticatedPage }) => {
  let capturedHeaders: Record<string, string> = {};
  
  await authenticatedPage.route('**/api/**', async (route) => {
    capturedHeaders = route.request().headers();
    await route.continue();
  });
  
  // Trigger API call
  await authenticatedPage.click('[data-testid="refresh-data"]');
  
  // Verify auth header
  expect(capturedHeaders['authorization']).toMatch(/^Bearer .+/);
});
```

### **Error Scenario Testing**

```typescript
// Test 401 unauthorized handling
await page.route('**/api/**', route => route.fulfill({ status: 401 }));
// Should redirect to login

// Test network failures
await page.route('**/api/**', route => route.abort());
// Should show error message

// Test timeout handling
await page.route('**/api/**', async route => {
  await new Promise(resolve => setTimeout(resolve, 15000));
  await route.continue();
});
```

## 📱 Mobile-First Responsive Testing

### **Multi-Viewport Strategy**

```typescript
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },    // iPhone SE
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1200, height: 800 }   // Desktop
};

// Test across all viewports
for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test(`should work on ${name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    // Test responsive behavior
  });
}
```

### **Touch and Gesture Testing**

```typescript
test('mobile interactions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Test tap gestures
  await page.locator('[data-testid="menu-button"]').tap();
  
  // Test swipe gestures (if applicable)
  await page.locator('[data-testid="chat-messages"]').swipe('up');
  
  // Test keyboard behavior
  await page.fill('[data-testid="message-input"]', 'Hello');
  await page.keyboard.press('Enter');
});
```

## 🧪 Mocking AWS Cognito

### **1. Service-Level Mocking (Recommended)**

```typescript
// Mock at the service boundary
class MockAuthTestUtils extends AuthTestUtils {
  async authenticateUser(username: string, password: string): Promise<AuthTokens> {
    // Return mock tokens for testing
    return {
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token', 
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000
    };
  }
}
```

### **2. Network-Level Mocking**

```typescript
// Intercept Cognito API calls
await page.route('**/cognito-idp/**', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        AuthenticationResult: {
          AccessToken: 'mock-token',
          IdToken: 'mock-id-token',
          RefreshToken: 'mock-refresh'
        }
      })
    });
  }
});
```

### **3. Test User Management**

```typescript
// Dedicated test users in Cognito User Pool
const TEST_USERS = {
  validUser: { username: 'test-valid', password: 'TempPass123!' },
  lockedUser: { username: 'test-locked', password: 'TempPass123!' },
  expiredUser: { username: 'test-expired', password: 'TempPass123!' }
};
```

## 🔄 Jest + RTL Integration

### **Complementary Testing Strategy**

```typescript
// Unit Tests (Jest + RTL)
describe('AuthButton Component', () => {
  it('should show login button when not authenticated', () => {
    render(<AuthButton />, { wrapper: AuthProvider });
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});

// E2E Tests (Playwright)
test('complete authentication flow', async ({ page }) => {
  // Test full user journey end-to-end
});
```

### **Shared Test Utilities**

```typescript
// tests/shared/auth-helpers.ts
export const createMockAuthState = (isAuthenticated: boolean) => ({
  user: isAuthenticated ? { id: '1', email: 'test@example.com' } : null,
  tokens: isAuthenticated ? { access: 'token' } : null,
  isLoading: false
});
```

## ☁️ CI/CD Integration (AWS Amplify)

### **GitHub Actions Workflow**

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        viewport: [mobile, desktop]
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps ${{ matrix.browser }}
    - run: npx playwright test --project=${{ matrix.browser }}
      env:
        COGNITO_USER_POOL_ID: ${{ secrets.TEST_COGNITO_USER_POOL_ID }}
        # ... other secrets
```

### **Amplify Build Configuration**

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    postBuild:
      commands:
        # Run E2E tests after build
        - |
          if [ "$AWS_BRANCH" = "main" ]; then
            npm run test:e2e -- --reporter=junit
            aws s3 cp playwright-report/ s3://$TEST_RESULTS_BUCKET/
          fi
```

### **Environment-Specific Testing**

```typescript
// Different test configurations per environment
const getTestConfig = () => {
  const env = process.env.NODE_ENV;
  
  return {
    production: {
      cognitoPoolId: process.env.PROD_COGNITO_POOL_ID,
      apiBaseUrl: process.env.PROD_API_URL,
      timeout: 30000
    },
    staging: {
      cognitoPoolId: process.env.STAGING_COGNITO_POOL_ID,
      apiBaseUrl: process.env.STAGING_API_URL,
      timeout: 15000
    }
  }[env];
};
```

## 📊 Testing Strategy Summary

### **Coverage Areas**

| Testing Layer | Framework | Coverage | Focus |
|--------------|-----------|----------|--------|
| **Unit Tests** | Jest + RTL | Components, Utils, Hooks | Logic, Rendering |
| **Integration** | Jest + RTL | Component Integration | Data Flow |
| **E2E Tests** | Playwright | Full User Journeys | User Experience |
| **Visual** | Playwright | UI Consistency | Cross-browser |
| **Performance** | Playwright | Load Times, Metrics | User Performance |

### **Authentication Test Matrix**

| Scenario | Method | Coverage |
|----------|--------|----------|
| **Login Flow** | UI Testing | Complete UX |
| **Token Refresh** | API Mocking | Error Handling |
| **Session Persistence** | State Testing | Data Integrity |
| **Route Protection** | Navigation Testing | Security |
| **API Authorization** | Request Interception | Backend Integration |

### **Mobile Testing Priorities**

1. **Touch Interactions** - Tap, swipe, pinch gestures
2. **Viewport Adaptation** - Layout changes across sizes  
3. **Performance** - Load times on slower connections
4. **Keyboard Behavior** - Virtual keyboard interactions
5. **Offline Scenarios** - Network connectivity issues

## 🎯 Conversation-Centric UX Testing

### **Chat Interface Specific Tests**

```typescript
test('conversation flow works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Test message sending
  await page.fill('[data-testid="message-input"]', 'Hei! Miten menee?');
  await page.keyboard.press('Enter');
  
  // Verify message appears
  await expect(page.locator('[data-testid="user-message"]').last()).toContainText('Hei!');
  
  // Test teacher response
  await expect(page.locator('[data-testid="teacher-response"]')).toBeVisible();
  
  // Test mobile keyboard handling
  await page.locator('[data-testid="message-input"]').tap();
  // Virtual keyboard should appear (test focus state)
});
```

## 🛠️ Development Workflow

### **Test-Driven Development**

1. **Write failing E2E test** for new feature
2. **Implement feature** to make test pass  
3. **Add unit tests** for edge cases
4. **Refactor** with confidence

### **Debugging Tests**

```bash
# Debug specific test
npx playwright test --debug auth.spec.ts

# Visual debugging
npm run test:e2e:ui

# Generate test code
npx playwright codegen localhost:5173
```

## 🔧 Best Practices

### **Test Organization**

```
tests/e2e/
├── fixtures/           # Reusable test fixtures
├── utils/             # Test utilities
├── auth/              # Authentication tests  
├── api/               # API integration tests
├── mobile/            # Mobile-specific tests
└── ci-cd/             # Deployment tests
```

### **Naming Conventions**

- `*.spec.ts` - Test files
- `*-utils.ts` - Utility files  
- `*-fixtures.ts` - Test fixtures
- `data-testid="*"` - Test selectors

### **Performance Considerations**

- Use programmatic auth for setup speed
- Parallel test execution where possible
- Selective test runs in CI/CD pipelines
- Efficient test data management

## 📈 Monitoring and Reporting

### **Test Result Tracking**

- Automated test reports in CI/CD
- Performance metrics over time
- Cross-browser compatibility tracking
- Mobile device coverage reports

### **Quality Gates**

- Minimum 80% E2E test pass rate
- All authentication flows must pass
- Mobile viewport tests required
- Performance budgets enforced

This comprehensive testing strategy ensures robust, reliable authentication flows across all devices while maintaining fast development cycles and deployment confidence.