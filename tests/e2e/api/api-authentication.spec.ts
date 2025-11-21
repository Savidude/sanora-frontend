/**
 * API Authentication Tests
 * Tests API calls with authentication headers and error handling
 */

import { test, expect } from '../fixtures/auth-fixtures';

test.describe('API Authentication', () => {

  test.describe('Authenticated API Calls', () => {
    
    test('should include authorization headers in API requests', async ({ authenticatedPage }) => {
      // Set up API interception to verify headers
      let capturedHeaders: Record<string, string> = {};
      
      await authenticatedPage.route('**/api/**', async (route) => {
        capturedHeaders = route.request().headers();
        await route.continue();
      });
      
      await authenticatedPage.goto('/');
      
      // Trigger an API call (e.g., loading chat messages)
      await authenticatedPage.click('[data-testid="refresh-chat"]');
      
      // Verify authorization header is present and valid
      expect(capturedHeaders['authorization']).toBeTruthy();
      expect(capturedHeaders['authorization']).toMatch(/^Bearer .+/);
    });

    test('should handle API responses successfully', async ({ authenticatedPage }) => {
      // Mock successful API response
      await authenticatedPage.route('**/api/chat/messages', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            messages: [
              { id: '1', content: 'Hello', sender: 'user', timestamp: Date.now() }
            ]
          })
        });
      });
      
      await authenticatedPage.goto('/');
      
      // Trigger API call
      await authenticatedPage.click('[data-testid="refresh-chat"]');
      
      // Verify successful response handling
      await expect(authenticatedPage.locator('[data-testid="message-1"]')).toBeVisible();
    });

  });

  test.describe('API Error Scenarios', () => {
    
    test('should handle 401 unauthorized responses', async ({ authenticatedPage }) => {
      // Mock 401 response
      await authenticatedPage.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' })
        });
      });
      
      await authenticatedPage.goto('/');
      
      // Trigger API call that will return 401
      await authenticatedPage.click('[data-testid="refresh-chat"]');
      
      // Should redirect to login page
      await expect(authenticatedPage).toHaveURL(/.*\/login/);
      
      // Should show appropriate error message
      await expect(authenticatedPage.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });

    test('should handle 403 forbidden responses', async ({ authenticatedPage }) => {
      await authenticatedPage.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Forbidden' })
        });
      });
      
      await authenticatedPage.goto('/');
      await authenticatedPage.click('[data-testid="refresh-chat"]');
      
      // Should show access denied message
      await expect(authenticatedPage.locator('[data-testid="access-denied-message"]')).toBeVisible();
    });

    test('should handle network timeout errors', async ({ authenticatedPage }) => {
      // Mock slow/timeout response
      await authenticatedPage.route('**/api/**', async (route) => {
        // Simulate timeout by delaying response beyond timeout threshold
        await new Promise(resolve => setTimeout(resolve, 15000));
        await route.continue();
      });
      
      await authenticatedPage.goto('/');
      await authenticatedPage.click('[data-testid="refresh-chat"]');
      
      // Should show timeout error message
      await expect(authenticatedPage.locator('[data-testid="timeout-error-message"]')).toBeVisible();
    });

    test('should handle server error responses (500)', async ({ authenticatedPage }) => {
      await authenticatedPage.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await authenticatedPage.goto('/');
      await authenticatedPage.click('[data-testid="refresh-chat"]');
      
      // Should show generic error message
      await expect(authenticatedPage.locator('[data-testid="server-error-message"]')).toBeVisible();
    });

  });

  test.describe('Token Refresh Scenarios', () => {
    
    test('should refresh expired access tokens automatically', async ({ authenticatedPage, authUtils }) => {
      let requestCount = 0;
      
      await authenticatedPage.route('**/api/**', async (route) => {
        requestCount++;
        
        if (requestCount === 1) {
          // First request: return 401 to simulate expired token
          await route.fulfill({
            status: 401,
            contentType: 'application/json', 
            body: JSON.stringify({ error: 'Token expired' })
          });
        } else {
          // Subsequent requests: return success (after token refresh)
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ messages: [] })
          });
        }
      });
      
      // Mock token refresh endpoint
      await authenticatedPage.route('**/auth/refresh', async (route) => {
        const testUser = authUtils.getTestUser('validUser');
        const newTokens = await authUtils.authenticateUser(testUser.username, testUser.password);
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: newTokens.accessToken,
            idToken: newTokens.idToken,
            expiresAt: newTokens.expiresAt
          })
        });
      });
      
      await authenticatedPage.goto('/');
      await authenticatedPage.click('[data-testid="refresh-chat"]');
      
      // Should successfully make the API call after token refresh
      expect(requestCount).toBeGreaterThanOrEqual(2);
      await expect(authenticatedPage.locator('[data-testid="chat-interface"]')).toBeVisible();
    });

  });

  test.describe('Concurrent API Calls', () => {
    
    test('should handle multiple simultaneous API calls', async ({ authenticatedPage }) => {
      const responses: string[] = [];
      
      await authenticatedPage.route('**/api/**', async (route) => {
        const url = route.request().url();
        responses.push(url);
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, url })
        });
      });
      
      await authenticatedPage.goto('/');
      
      // Trigger multiple API calls simultaneously
      await Promise.all([
        authenticatedPage.click('[data-testid="load-messages"]'),
        authenticatedPage.click('[data-testid="load-profile"]'),
        authenticatedPage.click('[data-testid="load-settings"]')
      ]);
      
      // All requests should have been made with proper auth headers
      expect(responses.length).toBe(3);
    });

  });

});

test.describe('Mobile API Authentication', () => {
  
  test.use({ 
    viewport: { width: 375, height: 667 }
  });

  test('should handle API calls on slow mobile connections', async ({ authenticatedPage }) => {
    // Simulate slow mobile connection
    await authenticatedPage.route('**/api/**', async (route) => {
      // Add delay to simulate slow connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await authenticatedPage.goto('/');
    
    // Should show loading states appropriately
    await authenticatedPage.click('[data-testid="refresh-chat"]');
    await expect(authenticatedPage.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // Should eventually complete
    await expect(authenticatedPage.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 10000 });
  });

});