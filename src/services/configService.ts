/**
 * Configuration Service
 * 
 * Manages application configuration from SSM Parameter Store with environment variable fallbacks
 */

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const SSM_PARAMETER_NAMES = {
  API_URL: '/sanora/apigw/messaging_service_url',
} as const;

/**
 * Environment variable fallbacks for local development
 * These are used when SSM parameters are not available
 * 
 * Note: Cognito configuration MUST come from environment variables because
 * SSM requires authentication, which creates a chicken-and-egg problem.
 */
const ENV_FALLBACKS = {
  API_URL: import.meta.env.VITE_API_URL,
} as const;

/**
 * Application configuration interface
 * 
 * Note: This only includes runtime configuration that requires authentication.
 * Cognito configuration is loaded separately from environment variables.
 */
export interface AppConfig {
  apiUrl: string;
}

/**
 * Configuration cache with TTL
 */
interface ConfigCache {
  config: AppConfig | null;
  timestamp: number;
  ttl: number;
}

const configCache: ConfigCache = {
  config: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
};

/**
 * Check if cached configuration is still valid
 */
function isCacheValid(): boolean {
  if (!configCache.config) return false;
  const now = Date.now();
  return now - configCache.timestamp < configCache.ttl;
}

/**
 * Fetch a parameter from SSM Parameter Store
 */
async function getSSMParameter(
  client: SSMClient,
  parameterName: string
): Promise<string | null> {
  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true,
    });
    const response = await client.send(command);
    return response.Parameter?.Value || null;
  } catch (error) {
    console.warn(`Failed to fetch SSM parameter ${parameterName}:`, error);
    return null;
  }
}

/**
 * Load configuration from SSM Parameter Store with fallback to environment variables
 * 
 * @param region - AWS region for SSM client (defaults to us-east-1)
 * @returns Application configuration
 * @throws Error if required configuration is missing
 */
export async function loadConfig(region: string = 'eu-central-1'): Promise<AppConfig> {
  // Return cached config if still valid
  if (isCacheValid() && configCache.config) {
    console.log('✓ Using cached configuration');
    return configCache.config;
  }

  console.log('⟳ Loading configuration from SSM Parameter Store...');

  // Initialize SSM client
  const ssmClient = new SSMClient({ region });

  // Attempt to fetch from SSM (only runtime config that requires auth)
  const apiUrl = await getSSMParameter(ssmClient, SSM_PARAMETER_NAMES.API_URL);

  // Build config with SSM values or environment fallbacks
  const config: AppConfig = {
    apiUrl: apiUrl || ENV_FALLBACKS.API_URL || '',
  };

  // Validate required configuration
  const missingFields: string[] = [];
  if (!config.apiUrl) missingFields.push('API_URL');

  if (missingFields.length > 0) {
    const error = `Missing required configuration: ${missingFields.join(', ')}`;
    console.error('✗ Configuration validation failed:', error);
    throw new Error(error);
  }

  // Cache the configuration
  configCache.config = config;
  configCache.timestamp = Date.now();

  // Log source of configuration (without exposing sensitive values)
  const sources = {
    apiUrl: apiUrl ? 'SSM' : 'ENV',
  };
  console.log('✓ Configuration loaded successfully:', sources);

  return config;
}

/**
 * Get cached configuration without making network requests
 * Returns null if no valid cache exists
 */
export function getCachedConfig(): AppConfig | null {
  return isCacheValid() ? configCache.config : null;
}

/**
 * Clear configuration cache
 * Useful for testing or forcing a refresh
 */
export function clearConfigCache(): void {
  configCache.config = null;
  configCache.timestamp = 0;
}

/**
 * Validate startup configuration
 * This is called during app initialization to ensure all required config is available
 */
export async function validateStartupConfig(): Promise<void> {
  try {
    await loadConfig();
    console.log('✓ Startup configuration validation passed');
  } catch (error) {
    console.error('✗ Startup configuration validation failed:', error);
    throw error;
  }
}
