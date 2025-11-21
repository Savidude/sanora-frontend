/**
 * CI/CD Pipeline Integration Tests
 * Tests specifically designed for AWS Amplify deployment pipeline
 */

import { test, expect } from '../fixtures/auth-fixtures';

test.describe('CI/CD Integration', () => {

  test.describe('Environment Configuration', () => {
    
    test('should load environment variables correctly', async ({ page }) => {
      // Test that environment configuration is loaded
      const configCheck = await page.evaluate(() => {
        return {
          hasApiUrl: !!window.localStorage.getItem('api-base-url') || !!process.env.VITE_API_BASE_URL,
          hasCognitoConfig: !!window.localStorage.getItem('cognito-config'),
          isProduction: process.env.NODE_ENV === 'production'
        };
      });
      
      expect(configCheck.hasApiUrl).toBeTruthy();
    });

    test('should handle missing configuration gracefully', async ({ page }) => {
      // Test application behavior when configuration is missing
      await page.addInitScript(() => {
        // Clear environment config to simulate missing config
        delete (window as any).ENV_CONFIG;
      });
      
      await page.goto('/');
      
      // Should show configuration error message
      await expect(page.locator('[data-testid="config-error"]')).toBeVisible();
    });

  });

  test.describe('Health Check Endpoints', () => {
    
    test('should respond to health check requests', async ({ page }) => {
      // Test health check endpoint
      const response = await page.request.get('/health');
      expect(response.status()).toBe(200);
      
      const healthData = await response.json();
      expect(healthData.status).toBe('healthy');
    });

    test('should report service dependencies status', async ({ page }) => {
      const response = await page.request.get('/health/detailed');
      
      if (response.ok()) {
        const healthData = await response.json();
        expect(healthData).toHaveProperty('cognito');
        expect(healthData).toHaveProperty('api');
      }
    });

  });

  test.describe('Deployment Validation', () => {
    
    test('should serve static assets correctly', async ({ page }) => {
      await page.goto('/');
      
      // Test CSS loading
      const cssResponse = await page.request.get('/assets/index.css');
      expect(cssResponse.status()).toBeLessThan(400);
      
      // Test JS loading  
      const jsResponse = await page.request.get('/assets/index.js');
      expect(jsResponse.status()).toBeLessThan(400);
    });

    test('should handle routing correctly in production', async ({ page }) => {
      // Test SPA routing works correctly
      await page.goto('/chat');
      await expect(page).toHaveURL('/chat');
      
      // Test direct URL access (important for SPA)
      await page.goto('/settings');
      await expect(page).toHaveURL('/settings');
    });

  });

  test.describe('Performance Tests', () => {
    
    test('should load within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="app-loaded"]');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle concurrent user loads', async ({ browser }) => {
      // Simulate multiple concurrent users
      const contexts = await Promise.all(
        Array.from({ length: 5 }, () => browser.newContext())
      );
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );
      
      // All users navigate simultaneously
      const startTime = Date.now();
      await Promise.all(
        pages.map(page => page.goto('/'))
      );
      
      // All should load successfully
      await Promise.all(
        pages.map(page => page.waitForSelector('[data-testid="app-loaded"]'))
      );
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(10000);
      
      // Clean up
      await Promise.all(contexts.map(context => context.close()));
    });

  });

});

test.describe('AWS Amplify Specific Tests', () => {

  test.describe('Build Process Validation', () => {
    
    test('should have correct build artifacts', async ({ page }) => {
      // Test that build process created necessary files
      const manifestResponse = await page.request.get('/manifest.json');
      expect(manifestResponse.status()).toBe(200);
      
      const manifest = await manifestResponse.json();
      expect(manifest.name).toBeDefined();
      expect(manifest.short_name).toBeDefined();
    });

  });

  test.describe('Environment-Specific Configuration', () => {
    
    test('should use correct API endpoints for environment', async ({ page }) => {
      // Verify API endpoint configuration
      const apiConfig = await page.evaluate(() => {
        return {
          baseURL: (window as any).API_BASE_URL || process.env.VITE_API_BASE_URL,
          environment: process.env.NODE_ENV
        };
      });
      
      // API URL should match environment
      if (process.env.NODE_ENV === 'production') {
        expect(apiConfig.baseURL).toContain('prod');
      } else {
        expect(apiConfig.baseURL).toContain('test');
      }
    });

  });

  test.describe('Branch-Based Deployments', () => {
    
    test('should handle feature branch deployments', async ({ page }) => {
      // Test that feature branches work correctly
      await page.goto('/');
      
      // Should load regardless of branch
      await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible();
      
      // Should show branch indicator in dev/staging
      if (process.env.NODE_ENV !== 'production') {
        const branchInfo = await page.locator('[data-testid="branch-info"]').textContent();
        expect(branchInfo).toBeTruthy();
      }
    });

  });

});