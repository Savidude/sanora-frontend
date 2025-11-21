/**
 * Authentication Flow Tests
 * Tests all authentication scenarios including login, logout, session persistence, etc.
 */

import { test, expect } from '../fixtures/auth-fixtures';

test.describe('Authentication Flows', () => {
  
  test.describe('Login Flow', () => {
    
    test('should redirect unauthenticated users to login page', async ({ page }) => {
      // Visit protected route without authentication
      await page.goto('/');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/.*\/login/);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });

    test('should successfully login with valid credentials', async ({ page, authUtils, testUser }) => {
      await page.goto('/login');
      
      // Fill login form
      await page.fill('[data-testid="username-input"]', testUser.username);
      await page.fill('[data-testid="password-input"]', testUser.password);
      
      // Submit form
      await page.click('[data-testid="login-button"]');
      
      // Should redirect to main app
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill with invalid credentials
      await page.fill('[data-testid="username-input"]', 'invalid-user');
      await page.fill('[data-testid="password-input"]', 'wrong-password');
      
      // Submit form
      await page.click('[data-testid="login-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
      
      // Should remain on login page
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should handle network errors gracefully', async ({ page, testUser }) => {
      // Mock network failure
      await page.route('**/auth/**', route => route.abort());
      
      await page.goto('/login');
      
      await page.fill('[data-testid="username-input"]', testUser.username);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.click('[data-testid="login-button"]');
      
      // Should show network error
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/network|connection/i);
    });

  });

  test.describe('Session Persistence', () => {
    
    test('should maintain authentication across browser restarts', async ({ authenticatedPage, browser }) => {
      // Navigate to protected page
      await authenticatedPage.goto('/');
      
      // Verify authenticated
      await expect(authenticatedPage.locator('[data-testid="chat-interface"]')).toBeVisible();
      
      // Create new context (simulates browser restart)
      const newContext = await browser.newContext();
      const newPage = await newContext.newPage();
      
      // Copy localStorage from authenticated context
      const localStorage = await authenticatedPage.evaluate(() => {
        const storage: Record<string, string> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i)!;
          storage[key] = window.localStorage.getItem(key)!;
        }
        return storage;
      });
      
      await newPage.addInitScript((storage) => {
        for (const [key, value] of Object.entries(storage)) {
          window.localStorage.setItem(key, value);
        }
      }, localStorage);
      
      // Navigate and verify still authenticated
      await newPage.goto('/');
      await expect(newPage.locator('[data-testid="chat-interface"]')).toBeVisible();
      
      await newContext.close();
    });

    test('should handle expired sessions correctly', async ({ page, authUtils }) => {
      // Create expired token
      const expiredTokens = {
        accessToken: 'expired.token.here',
        idToken: 'expired.id.token',
        refreshToken: 'refresh.token',
        expiresAt: Date.now() - 3600000 // Expired 1 hour ago
      };
      
      const testUser = authUtils.getTestUser('validUser');
      const localStorage = authUtils.createAuthLocalStorage(expiredTokens, testUser);
      
      await page.addInitScript((storage) => {
        for (const [key, value] of Object.entries(storage)) {
          window.localStorage.setItem(key, value);
        }
      }, localStorage);
      
      // Try to visit protected page
      await page.goto('/');
      
      // Should be redirected to login due to expired token
      await expect(page).toHaveURL(/.*\/login/);
    });

  });

  test.describe('Logout Flow', () => {
    
    test('should successfully logout user', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/');
      
      // Verify authenticated
      await expect(authenticatedPage.locator('[data-testid="chat-interface"]')).toBeVisible();
      
      // Logout
      await authenticatedPage.click('[data-testid="user-menu"]');
      await authenticatedPage.click('[data-testid="logout-button"]');
      
      // Should redirect to login
      await expect(authenticatedPage).toHaveURL(/.*\/login/);
      
      // Verify localStorage cleared
      const hasTokens = await authenticatedPage.evaluate(() => {
        return window.localStorage.getItem('cognito-tokens') !== null;
      });
      expect(hasTokens).toBe(false);
    });

  });

  test.describe('Route Protection', () => {
    
    const protectedRoutes = [
      '/',
      '/chat',
      '/settings',
      '/profile'
    ];

    protectedRoutes.forEach(route => {
      test(`should protect route ${route} from unauthenticated access`, async ({ page }) => {
        await page.goto(route);
        await expect(page).toHaveURL(/.*\/login/);
      });

      test(`should allow authenticated access to ${route}`, async ({ authenticatedPage }) => {
        await authenticatedPage.goto(route);
        // Should not be redirected to login
        await expect(authenticatedPage).not.toHaveURL(/.*\/login/);
      });
    });

  });

});

test.describe('Mobile Authentication', () => {
  
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE dimensions
  });

  test('should work on mobile viewports', async ({ page, testUser }) => {
    await page.goto('/login');
    
    // Verify mobile-friendly layout
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    
    // Test touch interactions
    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.tap('[data-testid="login-button"]');
    
    // Should successfully authenticate
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
  });

  test('should handle mobile keyboard interactions', async ({ page }) => {
    await page.goto('/login');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus username
    await page.keyboard.type('test-user');
    await page.keyboard.press('Tab'); // Focus password  
    await page.keyboard.type('password');
    await page.keyboard.press('Enter'); // Submit
    
    // Form should process submission
    await expect(page.locator('[data-testid="login-button"]')).toHaveAttribute('disabled');
  });

});