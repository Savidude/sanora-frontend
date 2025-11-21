/**
 * Mobile Responsive Testing Utilities
 * Provides helpers for testing responsive behavior across different viewports
 */

import { Page, Locator } from '@playwright/test';

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

export const VIEWPORTS: Record<string, ViewportConfig> = {
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  },
  desktop: {
    name: 'Desktop',
    width: 1200,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false
  },
  desktopLarge: {
    name: 'Desktop Large',
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false
  }
};

export class ResponsiveTestUtils {
  
  constructor(private page: Page) {}

  /**
   * Test element visibility across different viewports
   */
  async testElementAcrossViewports(
    locator: Locator, 
    viewports: ViewportConfig[] = Object.values(VIEWPORTS)
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const viewport of viewports) {
      await this.page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      // Wait for responsive layout changes
      await this.page.waitForTimeout(100);
      
      try {
        await locator.waitFor({ state: 'visible', timeout: 1000 });
        results[viewport.name] = true;
      } catch {
        results[viewport.name] = false;
      }
    }
    
    return results;
  }

  /**
   * Test touch interactions on mobile viewports
   */
  async testTouchInteraction(locator: Locator): Promise<boolean> {
    try {
      // Test tap gesture
      await locator.tap();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(startLocator: Locator): Promise<boolean> {
    try {
      await startLocator.focus();
      await this.page.keyboard.press('Tab');
      
      // Check if focus moved to next focusable element
      const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
      return focusedElement !== 'BODY';
    } catch {
      return false;
    }
  }

  /**
   * Test hamburger menu behavior on mobile
   */
  async testMobileMenuBehavior(): Promise<{
    menuVisible: boolean;
    toggleWorks: boolean;
    closeOnOverlayClick: boolean;
  }> {
    // Set mobile viewport
    await this.page.setViewportSize(VIEWPORTS.mobile);
    
    const hamburgerButton = this.page.locator('[data-testid="hamburger-menu-button"]');
    const mobileMenu = this.page.locator('[data-testid="mobile-menu"]');
    const menuOverlay = this.page.locator('[data-testid="menu-overlay"]');

    let menuVisible = false;
    let toggleWorks = false;
    let closeOnOverlayClick = false;

    try {
      // Test hamburger button visibility
      await hamburgerButton.waitFor({ state: 'visible' });
      menuVisible = true;

      // Test menu toggle
      await hamburgerButton.click();
      await mobileMenu.waitFor({ state: 'visible' });
      toggleWorks = true;

      // Test overlay close
      if (menuOverlay.isVisible()) {
        await menuOverlay.click();
        await mobileMenu.waitFor({ state: 'hidden' });
        closeOnOverlayClick = true;
      }
    } catch (error) {
      console.warn('Mobile menu test failed:', error);
    }

    return {
      menuVisible,
      toggleWorks,
      closeOnOverlayClick
    };
  }

  /**
   * Test form usability on mobile
   */
  async testMobileFormUsability(formSelector: string): Promise<{
    fieldsAccessible: boolean;
    keyboardVisible: boolean;
    submitWorks: boolean;
  }> {
    await this.page.setViewportSize(VIEWPORTS.mobile);
    
    const form = this.page.locator(formSelector);
    const inputs = form.locator('input, textarea, select');

    let fieldsAccessible = false;
    let keyboardVisible = false;
    let submitWorks = false;

    try {
      // Test field accessibility
      const inputCount = await inputs.count();
      if (inputCount > 0) {
        const firstInput = inputs.first();
        await firstInput.tap();
        await firstInput.focus();
        fieldsAccessible = true;

        // On real devices, virtual keyboard would appear
        // For testing, we check if input is focused
        keyboardVisible = await firstInput.evaluate(el => el === document.activeElement);
      }

      // Test form submission
      const submitButton = form.locator('button[type="submit"], input[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.tap();
        submitWorks = true;
      }
    } catch (error) {
      console.warn('Mobile form test failed:', error);
    }

    return {
      fieldsAccessible,
      keyboardVisible,
      submitWorks
    };
  }

  /**
   * Test scroll behavior on different viewports
   */
  async testScrollBehavior(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      await this.page.setViewportSize(viewport);
      
      try {
        // Scroll to bottom
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        // Check if scroll position changed
        const scrollY = await this.page.evaluate(() => window.scrollY);
        results[name] = scrollY > 0;
        
        // Reset scroll
        await this.page.evaluate(() => window.scrollTo(0, 0));
      } catch {
        results[name] = false;
      }
    }
    
    return results;
  }

  /**
   * Capture screenshots across viewports for visual testing
   */
  async captureResponsiveScreenshots(
    testName: string,
    viewports: ViewportConfig[] = Object.values(VIEWPORTS)
  ): Promise<string[]> {
    const screenshots: string[] = [];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(200); // Allow layout to settle
      
      const screenshotPath = `screenshots/${testName}-${viewport.name.toLowerCase()}.png`;
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      screenshots.push(screenshotPath);
    }
    
    return screenshots;
  }
}