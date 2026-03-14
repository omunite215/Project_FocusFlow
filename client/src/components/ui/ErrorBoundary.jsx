import { Component } from "react";
import Button from "./Button";
import Card from "./Card";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 p-4">
          <Card className="max-w-md text-center">
            <div className="mb-4 text-4xl">~</div>
            <h2 className="mb-2 text-lg font-semibold text-surface-800">
              Something went sideways
            </h2>
            <p className="mb-6 text-sm text-surface-500">
              No worries — this happens sometimes. Let&apos;s try again.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
            >
              Back to Home
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
