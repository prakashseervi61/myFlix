import React from 'react';

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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-center px-4">
            <div className="glass-morphism rounded-3xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6 opacity-60">😔</div>
              <h1 className="text-2xl font-bold text-white mb-4 neon-text">Something went wrong</h1>
              <p className="text-white/60 mb-8 leading-relaxed">We're sorry, but something unexpected happened.</p>
              <button
                onClick={this.handleReload}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all neon-glow"
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
