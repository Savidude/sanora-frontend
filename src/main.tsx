import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import './styles/globals.css';

/**
 * Initialize application with configuration validation
 */
async function initializeApp() {
  try {
    // Debug: Log all environment variables
    console.log('=== Environment Variables Debug ===');
    console.log('VITE_COGNITO_USER_POOL_ID:', import.meta.env.VITE_COGNITO_USER_POOL_ID);
    console.log('VITE_COGNITO_CLIENT_ID:', import.meta.env.VITE_COGNITO_CLIENT_ID);
    console.log('VITE_AWS_REGION:', import.meta.env.VITE_AWS_REGION);
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('All env:', import.meta.env);
    console.log('===================================');

    // Load Cognito configuration from environment variables
    // (SSM requires authentication, so we can't use it for initial auth config)
    const cognitoUserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
    const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

    if (!cognitoUserPoolId || !cognitoClientId) {
      console.error('Missing Cognito config - userPoolId:', cognitoUserPoolId, 'clientId:', cognitoClientId);
      throw new Error('Missing required Cognito configuration in environment variables');
    }

    // Configure Amplify with existing Cognito user pool from environment
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: cognitoUserPoolId,
          userPoolClientId: cognitoClientId,
          loginWith: {
            username: true,
          },
        },
      },
    });

    console.log('✓ Amplify configured with existing Cognito user pool');

    // Validate configuration is available
    const amplifyConfig = Amplify.getConfig();
    if (!amplifyConfig.Auth?.Cognito?.userPoolId) {
      throw new Error('Missing required Cognito configuration');
    }

    console.log('✓ Application configuration validated');

    // Render application
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('✗ Failed to initialize application:', error);
    
    // Render configuration error UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          background-color: #f9fafb;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            max-width: 500px;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          ">
            <svg style="width: 64px; height: 64px; margin: 0 auto 1rem; color: #ef4444;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 style="margin: 0 0 1rem 0; font-size: 1.5rem; color: #1f2937;">Configuration Error</h1>
            <p style="margin: 0 0 1rem 0; color: #6b7280; line-height: 1.5;">
              Failed to load application configuration. This may be due to missing environment variables or AWS configuration.
            </p>
            <p style="margin: 0 0 1.5rem 0; color: #9ca3af; font-size: 0.875rem;">
              Please ensure AWS Amplify is properly configured and try again.
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                padding: 0.75rem 1.5rem;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.backgroundColor='#2563eb'"
              onmouseout="this.style.backgroundColor='#3b82f6'"
            >
              Retry
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Initialize the application
initializeApp();
