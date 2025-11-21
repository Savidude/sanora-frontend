/**
 * AWS SSM Parameter Store Configuration Service
 * 
 * Retrieves and caches application configuration from SSM Parameter Store
 */

import { SSMClient, GetParameterCommand, GetParametersCommand } from '@aws-sdk/client-ssm';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Cloud configuration parameter
 */
interface CloudParameter {
  name: string;
  value: string;
  version: number;
  lastUpdated: Date;
  retrieved: Date;
  encrypted: boolean;
  ttl: number;
}

/**
 * Configuration cache with TTL
 */
interface ConfigCache {
  [key: string]: CloudParameter;
}

// Configuration cache
const configCache: ConfigCache = {};

// Default TTL for cached parameters (5 minutes)
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Create SSM client with authenticated credentials
 */
const createSSMClient = async (): Promise<SSMClient> => {
  try {
    const session = await fetchAuthSession();
    
    if (!session.credentials) {
      throw new Error('No AWS credentials available');
    }

    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';

    return new SSMClient({
      region,
      credentials: session.credentials,
    });
  } catch (error) {
    console.error('Failed to create SSM client:', error);
    throw new Error('Failed to initialize configuration service');
  }
};

/**
 * Load multiple configuration parameters with graceful degradation
 */
export const loadConfiguration = async (): Promise<CloudParameter[]> => {
  try {
    const ssmClient = await createSSMClient();

    const parameterNames = [
      import.meta.env.VITE_SSM_API_GATEWAY_URL || '/sanora/api-gateway-url',
      import.meta.env.VITE_SSM_COGNITO_USER_POOL_ID || '/sanora/cognito-user-pool-id',
      import.meta.env.VITE_SSM_COGNITO_CLIENT_ID || '/sanora/cognito-client-id',
    ];

    const command = new GetParametersCommand({
      Names: parameterNames,
      WithDecryption: true,
    });

    const response = await ssmClient.send(command);

    if (!response.Parameters || response.Parameters.length === 0) {
      console.warn('No parameters found in SSM, using environment variables');
      return loadFallbackConfiguration();
    }

    const parameters: CloudParameter[] = [];

    for (const param of response.Parameters) {
      if (!param.Name || !param.Value) {
        continue;
      }

      const parameter: CloudParameter = {
        name: param.Name,
        value: param.Value,
        version: param.Version || 1,
        lastUpdated: param.LastModifiedDate || new Date(),
        retrieved: new Date(),
        encrypted: param.Type === 'SecureString',
        ttl: DEFAULT_TTL,
      };

      // Cache the parameter
      configCache[param.Name] = parameter;
      parameters.push(parameter);
    }

    return parameters;
  } catch (error) {
    console.error('Failed to load configuration from SSM:', error);
    console.log('Falling back to environment variables');
    return loadFallbackConfiguration();
  }
};

/**
 * Load configuration from environment variables as fallback
 */
const loadFallbackConfiguration = (): CloudParameter[] => {
  const parameters: CloudParameter[] = [];

  // API Gateway URL fallback
  const apiGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL;
  if (apiGatewayUrl) {
    const param: CloudParameter = {
      name: import.meta.env.VITE_SSM_API_GATEWAY_URL || '/sanora/api-gateway-url',
      value: apiGatewayUrl,
      version: 1,
      lastUpdated: new Date(),
      retrieved: new Date(),
      encrypted: false,
      ttl: DEFAULT_TTL,
    };
    configCache[param.name] = param;
    parameters.push(param);
  }

  // Cognito User Pool ID fallback
  const userPoolId = import.meta.env.VITE_AWS_USER_POOL_ID;
  if (userPoolId) {
    const param: CloudParameter = {
      name: import.meta.env.VITE_SSM_COGNITO_USER_POOL_ID || '/sanora/cognito-user-pool-id',
      value: userPoolId,
      version: 1,
      lastUpdated: new Date(),
      retrieved: new Date(),
      encrypted: false,
      ttl: DEFAULT_TTL,
    };
    configCache[param.name] = param;
    parameters.push(param);
  }

  // Cognito Client ID fallback
  const clientId = import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID;
  if (clientId) {
    const param: CloudParameter = {
      name: import.meta.env.VITE_SSM_COGNITO_CLIENT_ID || '/sanora/cognito-client-id',
      value: clientId,
      version: 1,
      lastUpdated: new Date(),
      retrieved: new Date(),
      encrypted: false,
      ttl: DEFAULT_TTL,
    };
    configCache[param.name] = param;
    parameters.push(param);
  }

  return parameters;
};

/**
 * Get a specific parameter by name
 */
export const getParameter = (name: string): string | undefined => {
  const cached = configCache[name];

  if (!cached) {
    return undefined;
  }

  // Check if parameter is expired
  if (isParameterExpired(name)) {
    return undefined;
  }

  return cached.value;
};

/**
 * Check if a parameter is expired based on TTL
 */
export const isParameterExpired = (name: string): boolean => {
  const cached = configCache[name];

  if (!cached) {
    return true;
  }

  const age = Date.now() - cached.retrieved.getTime();
  return age > cached.ttl;
};

/**
 * Refresh a specific parameter from SSM
 */
export const refreshParameter = async (name: string): Promise<void> => {
  try {
    const ssmClient = await createSSMClient();

    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    });

    const response = await ssmClient.send(command);

    if (!response.Parameter || !response.Parameter.Value) {
      throw new Error(`Parameter ${name} not found`);
    }

    const param = response.Parameter;

    const parameter: CloudParameter = {
      name: param.Name || name,
      value: param.Value || '',
      version: param.Version || 1,
      lastUpdated: param.LastModifiedDate || new Date(),
      retrieved: new Date(),
      encrypted: param.Type === 'SecureString',
      ttl: DEFAULT_TTL,
    };

    configCache[name] = parameter;
  } catch (error) {
    console.error(`Failed to refresh parameter ${name}:`, error);
    throw new Error(`Failed to refresh parameter: ${name}`);
  }
};

/**
 * Get API Gateway URL from configuration
 */
export const getApiGatewayUrl = (): string => {
  const paramName = import.meta.env.VITE_SSM_API_GATEWAY_URL || '/sanora/api-gateway-url';
  const url = getParameter(paramName);
  
  if (!url) {
    // Fallback to environment variable
    return import.meta.env.VITE_API_GATEWAY_URL || 'https://api.sanora.app/v1';
  }
  
  return url;
};

/**
 * Get Cognito User Pool ID from configuration
 */
export const getCognitoUserPoolId = (): string => {
  const paramName = import.meta.env.VITE_SSM_COGNITO_USER_POOL_ID || '/sanora/cognito-user-pool-id';
  const poolId = getParameter(paramName);
  
  if (!poolId) {
    return import.meta.env.VITE_AWS_USER_POOL_ID || '';
  }
  
  return poolId;
};

/**
 * Get current environment
 */
export const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = import.meta.env.VITE_ENVIRONMENT || 'development';
  
  if (env === 'production' || env === 'staging') {
    return env;
  }
  
  return 'development';
};

/**
 * Clear configuration cache
 */
export const clearCache = (): void => {
  Object.keys(configCache).forEach((key) => {
    delete configCache[key];
  });
};

/**
 * Validate required configuration parameters are available
 * @throws Error if required parameters are missing
 */
export const validateConfiguration = async (): Promise<boolean> => {
  try {
    // Try to load configuration
    const parameters = await loadConfiguration();
    
    // Check if all required parameters are present
    const requiredParams = [
      import.meta.env.VITE_SSM_API_GATEWAY_URL || '/sanora/api-gateway-url',
      import.meta.env.VITE_SSM_COGNITO_USER_POOL_ID || '/sanora/cognito-user-pool-id',
      import.meta.env.VITE_SSM_COGNITO_CLIENT_ID || '/sanora/cognito-client-id',
    ];
    
    const missingParams = requiredParams.filter(
      (param) => !parameters.find((p) => p.name === param)
    );
    
    if (missingParams.length > 0) {
      console.error('Missing required configuration parameters:', missingParams);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
};

/**
 * Initialize configuration with error handling
 * Returns true if configuration loaded successfully, false otherwise
 */
export const initializeConfiguration = async (): Promise<boolean> => {
  try {
    await loadConfiguration();
    return true;
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
    return false;
  }
};
