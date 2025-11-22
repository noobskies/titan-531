
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-darker flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-900/20 p-6 rounded-full mb-6">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">
            The application encountered an unexpected error. We apologize for the inconvenience.
          </p>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 mb-8 max-w-sm w-full overflow-hidden text-left">
            <p className="font-mono text-xs text-red-400 break-words">
              {this.state.error?.message}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw size={18} className="mr-2" /> Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
