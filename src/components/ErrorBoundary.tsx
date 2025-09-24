import React from "react";
import { ErrorFallback } from "@/components/ErrorFallback";

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
        <ErrorFallback 
          title="Application Error"
          description="The application encountered an unexpected error. Please refresh the page to continue."
          showRetry={true}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
