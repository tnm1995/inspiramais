
import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error: error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-8 text-center font-sans">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-red-500 mb-4 font-serif">Algo deu errado.</h1>
          <p className="mb-6 text-gray-300">Não se preocupe, estamos cuidando disso.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-lg"
          >
            Recarregar Aplicativo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
