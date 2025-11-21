/**
 * Playwright Test Fixtures for AWS Cognito Authentication
 * Provides reusable authentication state for tests
 */

import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import { AuthTestUtils, TestUser, AuthTokens } from '../utils/auth-utils';

// Extend Playwright's base test with authentication fixtures
type AuthFixtures = {
  authUtils: AuthTestUtils;
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
  testUser: TestUser;
};

export const test = base.extend<AuthFixtures>({
  
  // Shared auth utils instance
  authUtils: async ({}, use) => {
    const authUtils = new AuthTestUtils();
    await use(authUtils);
  },

  // Test user fixture - defaults to valid user, but can be overridden
  testUser: async ({ authUtils }, use) => {
    await use(authUtils.getTestUser('validUser'));
  },

  // Pre-authenticated browser context
  authenticatedContext: async ({ browser, authUtils, testUser }, use) => {
    // Create a new browser context
    const context = await browser.newContext();
    
    // Authenticate user programmatically
    const tokens = await authUtils.authenticateUser(testUser.username, testUser.password);
    
    // Create localStorage data
    const localStorage = authUtils.createAuthLocalStorage(tokens, testUser);
    
    // Add localStorage data to context
    await context.addInitScript((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        window.localStorage.setItem(key, value);
      }
    }, localStorage);

    await use(context);
    await context.close();
  },

  // Pre-authenticated page
  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
  }
});

export { expect } from '@playwright/test';