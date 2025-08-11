import React from "react";

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("App error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong.</h1>
          <p className="text-sm text-gray-500">Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
