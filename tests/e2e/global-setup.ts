// Global setup for Playwright tests - runs once before all tests
import { FullConfig } from '@playwright/test';
import { AuthTestUtils } from './utils/auth-utils';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Pre-create test users and validate Cognito connection
    const authUtils = new AuthTestUtils();
    
    // Validate that test Cognito environment is accessible
    await authUtils.validateCognitoConnection();
    
    // Ensure test users exist (create if needed)
    await authUtils.ensureTestUsersExist();
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;