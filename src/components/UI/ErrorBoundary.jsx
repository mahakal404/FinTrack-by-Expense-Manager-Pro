import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg border border-red-50">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Rendering Interrupted</h1>
            <p className="text-sm text-slate-500 mb-6">A component failed to render correctly. We've safely caught the crash.</p>
            
            <pre className="bg-slate-100 p-4 rounded-xl text-left text-[11px] text-slate-600 overflow-auto max-h-40 mb-6 border border-slate-200">
               {this.state.error?.toString()}
            </pre>
            
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-95"
            >
               Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}
