import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-bank-surface flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-red-200 rounded-xl shadow-md p-10 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-bank-dark mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">
            An unexpected error occurred. Your accounts and data are safe.
          </p>
          {this.state.error?.message && (
            <pre className="text-left text-xs bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 text-red-600 whitespace-pre-wrap break-all">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/dashboard';
            }}
            className="w-full bg-bank-dark text-white font-semibold py-3 rounded-lg hover:bg-bank-teal transition-colors text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
}
