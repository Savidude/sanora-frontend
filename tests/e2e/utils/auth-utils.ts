/**
 * AWS Cognito Authentication Test Utilities
 * Handles authentication flows for testing without relying on UI interactions
 */

import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  UserNotFoundError
} from '@aws-sdk/client-cognito-identity-provider';

export interface TestUser {
  username: string;
  password: string;
  email: string;
  temporaryPassword?: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthTestUtils {
  private cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;
  private readonly clientId: string;
  
  // Test users for different scenarios
  public readonly testUsers: Record<string, TestUser> = {
    validUser: {
      username: 'test-user-valid',
      password: 'TempPass123!',
      email: 'test-valid@example.com'
    },
    lockedUser: {
      username: 'test-user-locked',
      password: 'TempPass123!',
      email: 'test-locked@example.com'
    },
    expiredUser: {
      username: 'test-user-expired', 
      password: 'TempPass123!',
      email: 'test-expired@example.com'
    }
  };

  constructor() {
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || '';
    this.clientId = process.env.COGNITO_CLIENT_ID || '';
    
    if (!this.userPoolId || !this.clientId) {
      throw new Error('Missing required Cognito environment variables');
    }

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Validate connection to Cognito User Pool
   */
  async validateCognitoConnection(): Promise<void> {
    try {
      // Try to get info about a test user (will throw if pool doesn't exist)
      await this.cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: 'validation-test-user' // This user doesn't need to exist
      }));
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        // This is expected and means the pool is accessible
        return;
      }
      throw new Error(`Cannot connect to Cognito User Pool: ${error}`);
    }
  }

  /**
   * Ensure all test users exist in the Cognito User Pool
   */
  async ensureTestUsersExist(): Promise<void> {
    for (const [key, user] of Object.entries(this.testUsers)) {
      try {
        await this.createTestUser(user);
        console.log(`✅ Test user ${key} ready`);
      } catch (error) {
        console.log(`ℹ️  Test user ${key} already exists or creation failed:`, error);
      }
    }
  }

  /**
   * Create a test user in Cognito User Pool
   */
  private async createTestUser(user: TestUser): Promise<void> {
    try {
      // Create user
      await this.cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: user.username,
        UserAttributes: [
          {
            Name: 'email',
            Value: user.email
          },
          {
            Name: 'email_verified',
            Value: 'true'
          }
        ],
        TemporaryPassword: user.password,
        MessageAction: 'SUPPRESS' // Don't send welcome email
      }));

      // Set permanent password
      await this.cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: user.username,
        Password: user.password,
        Permanent: true
      }));

    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        // User already exists, that's fine
        return;
      }
      throw error;
    }
  }

  /**
   * Programmatically authenticate a user and return tokens
   * This bypasses the UI login flow for faster test setup
   */
  async authenticateUser(username: string, password: string): Promise<AuthTokens> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error('Authentication failed - no tokens returned');
      }

      const { AccessToken, IdToken, RefreshToken, ExpiresIn } = response.AuthenticationResult;

      if (!AccessToken || !IdToken || !RefreshToken) {
        throw new Error('Authentication failed - missing tokens');
      }

      return {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        expiresAt: Date.now() + (ExpiresIn! * 1000)
      };

    } catch (error: any) {
      throw new Error(`Authentication failed for ${username}: ${error.message}`);
    }
  }

  /**
   * Create authentication localStorage state for browser injection
   * This simulates what your app does after successful login
   */
  createAuthLocalStorage(tokens: AuthTokens, user: TestUser): Record<string, string> {
    return {
      'cognito-tokens': JSON.stringify({
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt
      }),
      'user-profile': JSON.stringify({
        username: user.username,
        email: user.email,
        isAuthenticated: true
      })
    };
  }

  /**
   * Get test user credentials
   */
  getTestUser(type: keyof typeof this.testUsers): TestUser {
    return this.testUsers[type];
  }

  /**
   * Clean up test data (optional, for test isolation)
   */
  async cleanupTestSession(): Promise<void> {
    // Implementation depends on your app's logout mechanism
    // Could include token revocation, session cleanup, etc.
  }
}