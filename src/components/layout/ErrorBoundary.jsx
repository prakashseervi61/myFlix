import React from 'react';

/**
 * Error boundary for graceful error handling.
 * Catches React errors and displays fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center">
          <div className="text-center px-4">
            <div className="bg-[var(--color-surface)] border border-[rgba(192,146,124,0.15)] shadow-[var(--shadow-lg)] rounded-3xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6 opacity-60">😔</div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Something went wrong</h1>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">We're sorry, but something unexpected happened.</p>
              <button
                onClick={this.handleReload}
                className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-semibold hover:bg-[#a82e25] hover:-translate-y-[1px] transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
