'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Widget } from '@/lib/strapi';
import { widgetRegistry, WidgetError, WidgetProps, WidgetMetadata, WidgetValidator } from '@/lib/widgetLoader';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface WidgetRendererProps {
  widget: Widget;
  configuration?: Record<string, any>;
  locale?: string;
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

interface WidgetState {
  component: React.ComponentType<any> | null;
  loading: boolean;
  error: Error | null;
  manifest: any;
}

const WidgetErrorBoundary: React.FC<{
  children: React.ReactNode;
  packageName: string;
  onError?: (error: Error) => void;
  onRetry?: () => void;
}> = ({ children, packageName, onError, onRetry }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const widgetError = new WidgetError(
        `Runtime error in widget ${packageName}`,
        packageName,
        undefined,
        new Error(event.message)
      );
      setError(widgetError);
      setHasError(true);
      onError?.(widgetError);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [packageName, onError]);

  if (hasError && error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Widget Error: {packageName}
            </h3>
            <p className="text-sm text-red-700 mb-3">
              {error.message}
            </p>
            {onRetry && (
              <button
                onClick={() => {
                  setHasError(false);
                  setError(null);
                  onRetry();
                }}
                className="inline-flex items-center text-sm text-red-600 hover:text-red-500 font-medium"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const WidgetSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div
    className="bg-gray-100 rounded-lg animate-pulse"
    style={{ height: `${height}px` }}
  >
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  configuration = {},
  locale = 'en',
  className = '',
  onError,
  onLoad,
}) => {
  const [widgetState, setWidgetState] = useState<WidgetState>({
    component: null,
    loading: true,
    error: null,
    manifest: null,
  });

  const { packageName, version } = widget.attributes;

  const loadWidget = useCallback(async () => {
    setWidgetState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load widget manifest first
      const manifest = await WidgetMetadata.loadManifest(packageName, version);

      // Validate configuration against manifest
      if (manifest?.props) {
        const validation = WidgetValidator.validateProps(configuration, manifest);
        if (!validation.isValid) {
          throw new WidgetError(
            `Invalid configuration: ${validation.errors.join(', ')}`,
            packageName,
            version
          );
        }
      }

      // Load the actual widget component
      const component = await widgetRegistry.loadWidget(packageName, version);

      setWidgetState({
        component,
        loading: false,
        error: null,
        manifest,
      });

      onLoad?.();
    } catch (error) {
      const widgetError = error instanceof WidgetError
        ? error
        : new WidgetError(
            `Failed to load widget ${packageName}`,
            packageName,
            version,
            error as Error
          );

      setWidgetState({
        component: null,
        loading: false,
        error: widgetError,
        manifest: null,
      });

      onError?.(widgetError);
      console.error('Widget loading error:', widgetError);
    }
  }, [packageName, version, configuration, onLoad, onError]);

  // Load widget on mount or when dependencies change
  useEffect(() => {
    loadWidget();
  }, [loadWidget]);

  // Prepare widget props
  const widgetProps: WidgetProps = {
    configuration: {
      ...widget.attributes.configuration,
      ...configuration,
    },
    locale,
    onError: (error: Error) => {
      const widgetError = new WidgetError(
        `Widget runtime error: ${error.message}`,
        packageName,
        version,
        error
      );
      setWidgetState(prev => ({ ...prev, error: widgetError }));
      onError?.(widgetError);
    },
    onLoad,
  };

  // Render loading state
  if (widgetState.loading) {
    const skeletonHeight = widgetState.manifest?.preview?.height || 200;
    return (
      <div className={`widget-container widget-loading ${className}`}>
        <WidgetSkeleton height={skeletonHeight} />
      </div>
    );
  }

  // Render error state
  if (widgetState.error) {
    return (
      <div className={`widget-container widget-error ${className}`}>
        <WidgetErrorBoundary
          packageName={packageName}
          onError={onError}
          onRetry={loadWidget}
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Failed to load widget: {widget.attributes.name}
                </h3>
                <p className="text-sm text-red-700 mb-2">
                  Package: {packageName}@{version}
                </p>
                <p className="text-sm text-red-600">
                  {widgetState.error.message}
                </p>
                <button
                  onClick={loadWidget}
                  className="mt-3 inline-flex items-center text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </WidgetErrorBoundary>
      </div>
    );
  }

  // Render the widget component
  if (widgetState.component) {
    const WidgetComponent = widgetState.component;

    return (
      <div
        className={`widget-container widget-loaded ${className}`}
        data-widget-name={widget.attributes.name}
        data-widget-package={packageName}
        data-widget-version={version}
      >
        <WidgetErrorBoundary
          packageName={packageName}
          onError={onError}
          onRetry={loadWidget}
        >
          <Suspense fallback={<WidgetSkeleton />}>
            <WidgetComponent {...widgetProps} />
          </Suspense>
        </WidgetErrorBoundary>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className={`widget-container widget-unknown ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">Unknown widget state</p>
          <button
            onClick={loadWidget}
            className="mt-2 text-sm text-blue-600 hover:text-blue-500"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetRenderer;
