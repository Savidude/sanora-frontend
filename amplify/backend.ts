import { defineBackend } from '@aws-amplify/backend'

/**
 * Amplify Gen 2 Backend Configuration
 * 
 * Note: This frontend uses an existing Cognito user pool managed separately.
 * The Cognito configuration is loaded from SSM Parameter Store at runtime.
 * 
 * Backend resources are minimal since authentication is handled by existing infrastructure.
 */
const backend = defineBackend({
  // No auth resource - using existing Cognito user pool from SSM parameters
})

// Export backend for use in application
export default backend
