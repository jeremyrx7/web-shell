// Widget types and utilities for dynamic loading

// Widget registry to store loaded widget components
export class WidgetRegistry {
  private static instance: WidgetRegistry;
  private widgets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): WidgetRegistry {
    if (!WidgetRegistry.instance) {
      WidgetRegistry.instance = new WidgetRegistry();
    }
    return WidgetRegistry.instance;
  }

  /**
   * Load a widget dynamically from the widget library
   */
  async loadWidget(packageName: string, version?: string): Promise<any> {
    const cacheKey = `${packageName}@${version || "latest"}`;

    // Return cached widget if already loaded
    if (this.widgets.has(cacheKey)) {
      return this.widgets.get(cacheKey);
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Start loading the widget
    const loadingPromise = this.loadWidgetFromRegistry(packageName, version);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const widgetComponent = await loadingPromise;
      this.widgets.set(cacheKey, widgetComponent);
      this.loadingPromises.delete(cacheKey);
      return widgetComponent;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Load widget from NPM registry or CDN
   */
  private async loadWidgetFromRegistry(
    packageName: string,
    version?: string,
  ): Promise<any> {
    const versionString = version || "latest";

    try {
      // Try to load from node_modules first (for development)
      try {
        const widgetModule = await import(packageName);
        return widgetModule.default || widgetModule;
      } catch {
        // Fall back to CDN loading
        console.log(`Loading ${packageName} from CDN...`);
        return await this.loadFromCDN(packageName, versionString);
      }
    } catch (error) {
      console.error(`Failed to load widget ${packageName}:`, error);
      throw new Error(`Widget ${packageName} could not be loaded`);
    }
  }

  /**
   * Load widget from CDN (unpkg or similar)
   */
  private async loadFromCDN(
    packageName: string,
    version: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const cdnUrl = `https://unpkg.com/${packageName}@${version}/dist/index.umd.js`;

      script.src = cdnUrl;
      script.type = "text/javascript";

      script.onload = () => {
        // Assuming the widget exposes itself on window
        const globalName = this.getGlobalName(packageName);
        const widget = (window as any)[globalName];

        if (!widget) {
          reject(
            new Error(
              `Widget ${packageName} not found on window.${globalName}`,
            ),
          );
          return;
        }

        resolve(widget);
        document.head.removeChild(script);
      };

      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load widget from CDN: ${cdnUrl}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Convert package name to global variable name
   * @example @widget-library/core -> WidgetLibraryCore
   */
  private getGlobalName(packageName: string): string {
    return packageName
      .replace(/[@\/\-]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  /**
   * Preload multiple widgets
   */
  async preloadWidgets(
    widgets: Array<{ packageName: string; version?: string }>,
  ): Promise<void> {
    const loadPromises = widgets.map((widget) =>
      this.loadWidget(widget.packageName, widget.version).catch((error) => {
        console.warn(`Failed to preload widget ${widget.packageName}:`, error);
        return null;
      }),
    );

    await Promise.allSettled(loadPromises);
  }

  /**
   * Get a loaded widget component
   */
  getWidget(packageName: string, version?: string): any {
    const cacheKey = `${packageName}@${version || "latest"}`;
    return this.widgets.get(cacheKey);
  }

  /**
   * Check if a widget is loaded
   */
  isWidgetLoaded(packageName: string, version?: string): boolean {
    const cacheKey = `${packageName}@${version || "latest"}`;
    return this.widgets.has(cacheKey);
  }

  /**
   * Clear widget cache
   */
  clearCache(): void {
    this.widgets.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get all loaded widgets
   */
  getLoadedWidgets(): Array<{ packageName: string; version: string }> {
    const loaded = [];
    for (const [cacheKey] of this.widgets) {
      const [packageName, version] = cacheKey.split("@");
      loaded.push({ packageName, version });
    }
    return loaded;
  }
}

// Widget loader utilities
export interface WidgetProps {
  configuration?: Record<string, any>;
  data?: any;
  locale?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export interface WidgetManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  repository?: string;
  homepage?: string;
  keywords?: string[];
  props?: Record<
    string,
    {
      type: string;
      required?: boolean;
      default?: any;
      description?: string;
    }
  >;
  preview?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
  };
}

/**
 * Widget metadata loader
 */
export class WidgetMetadata {
  private static cache: Map<string, WidgetManifest> = new Map();

  /**
   * Load widget manifest/metadata
   */
  static async loadManifest(
    packageName: string,
    version?: string,
  ): Promise<WidgetManifest | null> {
    const cacheKey = `${packageName}@${version || "latest"}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try to load package.json from CDN
      const manifestUrl = `https://unpkg.com/${packageName}@${version || "latest"}/package.json`;
      const response = await fetch(manifestUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.statusText}`);
      }

      const packageJson = await response.json();

      // Extract widget-specific metadata
      const manifest: WidgetManifest = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description || "",
        author: packageJson.author || "",
        repository: packageJson.repository?.url,
        homepage: packageJson.homepage,
        keywords: packageJson.keywords || [],
        props: packageJson.widgetConfig?.props,
        preview: packageJson.widgetConfig?.preview,
      };

      this.cache.set(cacheKey, manifest);
      return manifest;
    } catch (error) {
      console.error(`Failed to load manifest for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Clear manifest cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Widget error boundary utilities
 */
export class WidgetError extends Error {
  constructor(
    message: string,
    public packageName: string,
    public version?: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "WidgetError";
  }
}

/**
 * Widget validation utilities
 */
export class WidgetValidator {
  /**
   * Validate widget props against manifest
   */
  static validateProps(
    props: Record<string, any>,
    manifest: WidgetManifest,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest.props) {
      return { isValid: true, errors: [] };
    }

    // Check required props
    Object.entries(manifest.props).forEach(([propName, propConfig]) => {
      if (propConfig.required && !(propName in props)) {
        errors.push(`Required prop '${propName}' is missing`);
      }

      // Basic type checking
      if (propName in props && propConfig.type) {
        const actualType = typeof props[propName];
        const expectedType = propConfig.type.toLowerCase();

        if (actualType !== expectedType && expectedType !== "any") {
          errors.push(
            `Prop '${propName}' should be of type '${expectedType}', got '${actualType}'`,
          );
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const widgetRegistry = WidgetRegistry.getInstance();
