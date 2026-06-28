import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              We encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-safety-blue hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
            >
              Refresh Page
            </button>
            
            {import.meta.env?.DEV && this.state.error && (
              <div className="mt-8 text-left bg-gray-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-red-500 font-mono">
                <p className="font-bold mb-2">{this.state.error.toString()}</p>
                <p className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
