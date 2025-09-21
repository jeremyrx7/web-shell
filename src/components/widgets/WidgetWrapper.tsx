"use client";

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface WidgetWrapperProps {
  /** Widget position identifier for debugging/tracking */
  position?: string;
  /** Page context */
  pageType?: string;
  /** Custom CSS classes for the wrapper */
  className?: string;
  /** Minimum height for the widget container */
  minHeight?: string;
  /** Widget component as children */
  children: React.ReactNode;
  /** Called when widget loads successfully */
  onLoad?: (position?: string) => void;
  /** Called when widget fails to load */
  onError?: (error: Error, position?: string) => void;
}

export default function WidgetWrapper({
  position,
  pageType,
  className = "",
  minHeight = "min-h-[200px]",
  children,
  onLoad,
  onError,
}: WidgetWrapperProps) {
  React.useEffect(() => {
    // Call onLoad when component mounts
    onLoad?.(position);
  }, [position, onLoad]);

  return (
    <div
      className={`widget-wrapper ${className}`}
      data-position={position}
      data-page-type={pageType}
    >
      <WidgetErrorBoundary
        position={position}
        onError={onError}
        minHeight={minHeight}
      >
        <div className="widget-content">{children}</div>
      </WidgetErrorBoundary>
    </div>
  );
}

// Error boundary for widget components
class WidgetErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    position?: string;
    minHeight?: string;
    onError?: (error: Error, position?: string) => void;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    position?: string;
    minHeight?: string;
    onError?: (error: Error, position?: string) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Widget error at position ${this.props.position}:`,
      error,
      errorInfo,
    );
    this.props.onError?.(error, this.props.position);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`bg-red-50 border border-red-200 rounded-lg ${this.props.minHeight || "min-h-[200px]"}`}
        >
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Widget Error
              </h3>
              <p className="text-sm text-red-600 mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              {this.props.position && (
                <p className="text-xs text-red-500">
                  Position: {this.props.position}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export type { WidgetWrapperProps };
