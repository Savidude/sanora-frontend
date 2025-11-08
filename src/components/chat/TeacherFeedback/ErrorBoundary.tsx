import { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for teacher response components
 * Catches rendering errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Teacher response component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorContainer} role="alert">
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Unable to display teacher response</h3>
          <p className={styles.errorMessage}>
            There was an error displaying this message. Please try refreshing the page.
          </p>
          {this.state.error && (
            <details className={styles.errorDetails}>
              <summary className={styles.errorSummary}>Technical details</summary>
              <pre className={styles.errorStack}>{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
