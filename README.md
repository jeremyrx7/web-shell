# Web Shell - NPM Widget Platform

A sports betting website shell that dynamically loads React widgets from npm packages. Teams can develop, publish, and deploy widgets independently while maintaining a consistent user experience.

## 🏗️ Architecture Overview

The Web Shell provides:

- **Layout Framework**: Sports betting themed navigation, responsive grid system
- **Widget Loading System**: Dynamic import of widgets from npm packages
- **Shared State Management**: Props passing and event handling between shell and widgets
- **Consistent Styling**: Tailwind CSS design system and responsive breakpoints

## 🎯 How It Works

Instead of monolithic pages, the platform uses **WidgetWrapper** components that:

1. **Dynamically import** npm packages at runtime
2. **Pass props** from shell to widget components
3. **Handle loading/error states** gracefully
4. **Cache components** for performance

```tsx
<WidgetWrapper
  packageName="@sportsbet/live-events"
  widgetProps={{ locale, maxEvents: 10 }}
  position="main-content"
  onLoad={(pkg) => console.log(`${pkg} loaded`)}
/>
```

## 🚀 Quick Start

### Installation

```bash
git clone <repository>
cd web-shell
npm install
npm run dev
```

Visit `http://localhost:3000` to see the platform.

### Project Structure

```
src/
├── app/[locale]/              # Next.js pages with widget slots
│   ├── page.tsx              # Home page (12 widget slots)
│   ├── details/page.tsx      # Details page (7 widget slots)
│   └── layout.tsx            # Root layout with navigation
├── components/
│   ├── layout/               # Navigation, header, sidebar
│   └── widgets/
│       └── WidgetWrapper.tsx # Core widget loading component
└── i18n/                     # Multi-language support
```

## 📦 Widget Development Guide

### 1. Create Your Widget Package

```bash
mkdir my-live-events-widget
cd my-live-events-widget
npm init -y
```

```json
// package.json
{
  "name": "@sportsbet/live-events",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 2. Build Your Widget Component

```tsx
// src/LiveEventsWidget.tsx
import React from "react";

interface LiveEventsProps {
  locale: string;
  maxEvents: number;
  autoRefresh?: boolean;
  sports: string[];
  onEventClick?: (eventId: string) => void;
}

const LiveEventsWidget: React.FC<LiveEventsProps> = ({
  locale,
  maxEvents,
  autoRefresh = true,
  sports,
  onEventClick,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Events</h2>
        {autoRefresh && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Your widget UI here */}
      <div className="grid gap-3">{/* Event items */}</div>
    </div>
  );
};

export default LiveEventsWidget;
```

### 3. Export Your Widget

```tsx
// src/index.ts
export { default } from "./LiveEventsWidget";
export type { LiveEventsProps } from "./LiveEventsWidget";
```

### 4. Build and Publish

```bash
# Build your widget
npm run build

# Publish to npm
npm publish --access public
```

### 5. Use in Web Shell

```tsx
// In web-shell pages
<WidgetWrapper
  packageName="@sportsbet/live-events"
  version="1.0.0"
  widgetProps={{
    locale,
    maxEvents: 10,
    autoRefresh: true,
    sports: ["football", "basketball"],
    onEventClick: (eventId) => console.log("Event clicked:", eventId),
  }}
/>
```

## 🎨 Widget Design Guidelines

### Styling Standards

Use Tailwind CSS classes for consistent styling:

```tsx
// Good: Use design system colors
<div className="bg-white border border-gray-200 rounded-lg p-4">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
  <p className="text-gray-600">Description</p>
</div>

// Good: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

### Color Palette

```css
Primary: #2563eb (blue-600)
Success: #16a34a (green-600)
Warning: #ca8a04 (yellow-600)
Error: #dc2626 (red-600)
Gray: #374151 to #f9fafb
```

### Interactive Elements

```tsx
// Buttons
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
  Place Bet
</button>

// Cards
<div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
  {/* Card content */}
</div>
```

## 📍 Available Widget Slots

### Home Page (`/`)

| Position           | Package Example              | Props                                   |
| ------------------ | ---------------------------- | --------------------------------------- |
| `hero`             | `@sportsbet/hero-banner`     | `{ locale, showSignupButton }`          |
| `live-events`      | `@sportsbet/live-events`     | `{ locale, maxEvents, sports[] }`       |
| `bet-slip`         | `@sportsbet/bet-slip`        | `{ locale, userId, currency }`          |
| `sports-grid-*`    | `@sportsbet/sports-category` | `{ sport, icon, eventCount }`           |
| `todays-matches`   | `@sportsbet/match-schedule`  | `{ locale, date, maxMatches }`          |
| `featured-matches` | `@sportsbet/featured-events` | `{ locale, maxEvents, priority }`       |
| `promotions`       | `@sportsbet/promotions`      | `{ locale, userId, currency }`          |
| `casino-games`     | `@sportsbet/casino-preview`  | `{ locale, maxGames, gameTypes[] }`     |
| `virtual-sports`   | `@sportsbet/virtual-sports`  | `{ locale, games[], showNextRace }`     |
| `news-feed`        | `@sportsbet/news-feed`       | `{ locale, maxArticles, categories[] }` |
| `stats-footer`     | `@sportsbet/stats-bar`       | `{ locale, showUserCount, currency }`   |

### Details Page (`/details`)

| Position        | Package Example                 | Props                             |
| --------------- | ------------------------------- | --------------------------------- |
| `primary`       | `@sportsbet/details-hero`       | `{ locale, showBreadcrumb }`      |
| `grid-left`     | `@sportsbet/stats-widget`       | `{ locale, layout, showTrends }`  |
| `grid-right`    | `@sportsbet/quick-stats`        | `{ locale, format, animate }`     |
| `detailed-info` | `@sportsbet/detailed-info`      | `{ locale, showExpandable }`      |
| `sidebar-*`     | `@sportsbet/sidebar-info`       | `{ locale, type, compact }`       |
| `bottom-full`   | `@sportsbet/additional-details` | `{ locale, layout, showActions }` |

## 🔄 Widget Loading Methods

### Method 1: Node Modules (Recommended)

```bash
# Install widget in web-shell
cd web-shell
npm install @sportsbet/live-events
```

The WidgetWrapper will automatically import from `node_modules`.

### Method 2: Widget Registry

Set environment variable:

```bash
NEXT_PUBLIC_WIDGET_REGISTRY_URL=https://widgets.yourcompany.com
```

Widgets are fetched from your registry at runtime.

### Method 3: CDN Loading

```bash
NEXT_PUBLIC_WIDGET_CDN_URL=https://unpkg.com
```

Load widgets directly from CDN (e.g., unpkg.com).

## 📱 Responsive Design

All widgets must be mobile-responsive:

```tsx
const MyWidget = () => (
  <div className="p-4">
    {/* Mobile: Stack vertically */}
    <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:items-center">
      <div className="flex-1">
        <h3 className="text-base md:text-lg font-semibold">Title</h3>
        <p className="text-sm md:text-base text-gray-600">Description</p>
      </div>
      <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg">
        Action
      </button>
    </div>
  </div>
);
```

## 🔧 Advanced Widget Features

### State Management

```tsx
// Widget with internal state
const LiveEventsWidget = ({ maxEvents, onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <div>
      {events.slice(0, maxEvents).map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => onEventClick(event.id)}
        />
      ))}
    </div>
  );
};
```

### Error Boundaries

```tsx
// Widgets are automatically wrapped in error boundaries
const MyWidget = () => {
  if (someError) {
    throw new Error("Widget failed to render");
  }

  return <div>Widget content</div>;
};
```

### Loading States

```tsx
// Show loading while data fetches
import useSWR from "swr";

const MyWidget = () => {
  const { data, error, isLoading } = useSWR("/api/widget-data", fetcher);

  if (isLoading)
    return <div className="animate-pulse bg-gray-200 h-32 rounded" />;
  if (error) return <div className="text-red-600">Error loading data</div>;

  return <div>{/* Widget content with data */}</div>;
};
```

## 🧪 Testing Widgets

### Unit Testing

```tsx
// MyWidget.test.tsx
import { render, screen } from "@testing-library/react";
import MyWidget from "./MyWidget";

describe("MyWidget", () => {
  it("renders with props", () => {
    render(<MyWidget locale="en" maxItems={5} />);
    expect(screen.getByText("Widget Title")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const onClickMock = jest.fn();
    render(<MyWidget onItemClick={onClickMock} />);

    // Test interactions
  });
});
```

### Integration Testing

```tsx
// Test widget in web-shell context
describe("Widget Integration", () => {
  it("loads widget from package", async () => {
    render(
      <WidgetWrapper
        packageName="@sportsbet/my-widget"
        widgetProps={{ locale: "en" }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("widget-content")).toBeInTheDocument();
    });
  });
});
```

## 🚀 Deployment

### Widget Deployment

1. **Build and test** your widget
2. **Update version** in package.json
3. **Publish to npm**
4. **Update web-shell** dependency
5. **Deploy web-shell**

```bash
# In widget repository
npm version patch
npm publish

# In web-shell repository
npm update @sportsbet/my-widget
npm run build
# Deploy to production
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.sportsbet.com
NEXT_PUBLIC_WIDGET_REGISTRY_URL=https://widgets.sportsbet.com
NEXT_PUBLIC_CDN_URL=https://cdn.sportsbet.com
```

### Build Optimization

```typescript
// next.config.ts
module.exports = {
  transpilePackages: [
    "@sportsbet/live-events",
    "@sportsbet/bet-slip",
    // Add your widget packages here
  ],
  experimental: {
    optimizeCss: true,
  },
};
```

## 🐛 Debugging

### Widget Debug Mode

```bash
# Enable debug logging
localStorage.setItem('widget-debug', 'true');
```

### Common Issues

1. **Widget Not Loading**

   ```bash
   # Check if package is installed
   npm ls @sportsbet/my-widget

   # Check console for import errors
   # Verify package exports default component
   ```

2. **Props Not Received**

   ```tsx
   // Add prop debugging
   const MyWidget = (props) => {
     console.log("Widget props:", props);
     return <div>{/* widget */}</div>;
   };
   ```

3. **Styling Issues**
   ```tsx
   // Ensure Tailwind classes are available
   // Check for CSS conflicts
   // Verify responsive breakpoints work
   ```

## 🤝 Team Workflow

### Widget Development Process

1. **Plan**: Define widget requirements and API contract
2. **Develop**: Build widget with mock data and tests
3. **Package**: Create npm package with proper exports
4. **Publish**: Release to npm registry
5. **Integrate**: Install in web-shell and test
6. **Deploy**: Release web-shell with new widget

### Version Management

```json
// Semantic versioning
"1.0.0" // Major.Minor.Patch
"^1.0.0" // Compatible changes
"~1.0.0" // Patch changes only
"1.0.0" // Exact version
```

### Code Review Checklist

- [ ] Widget exports default React component
- [ ] Props interface is properly typed
- [ ] Responsive design implemented
- [ ] Loading/error states handled
- [ ] Tests cover main functionality
- [ ] Documentation updated

## 📚 API Reference

### WidgetWrapper Props

```tsx
interface WidgetWrapperProps {
  packageName: string; // NPM package name
  version?: string; // Package version (default: 'latest')
  widgetProps?: Record<string, any>; // Props passed to widget
  className?: string; // CSS classes for wrapper
  minHeight?: string; // Minimum height class
  position?: string; // Position identifier
  pageType?: string; // Page context
  fallback?: React.ComponentType; // Fallback component
  onLoad?: (packageName: string) => void; // Load success callback
  onError?: (error: Error, packageName: string) => void; // Error callback
}
```

### Standard Widget Props

All widgets receive these standard props:

```tsx
interface StandardWidgetProps {
  locale: string; // Current language ('en', 'fr')
  _internal?: {
    // Internal shell data
    packageName: string;
    version: string;
    position: string;
    pageType: string;
  };
}
```

### Widget Event Handlers

Common callback patterns:

```tsx
interface WidgetCallbacks {
  onItemClick?: (itemId: string) => void;
  onError?: (error: Error) => void;
  onDataLoad?: (data: any) => void;
  onUserAction?: (action: string, data: any) => void;
}
```

## 🔗 Useful Links

### Development

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/

### Testing

- **Jest**: https://jestjs.io/docs
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/

### Deployment

- **NPM Publishing**: https://docs.npmjs.com/cli/v8/commands/npm-publish
- **Vercel**: https://vercel.com/docs

## 📞 Support

### Getting Help

- **Slack**: #web-shell-support
- **Internal Wiki**: https://wiki.company.com/web-shell
- **GitHub Issues**: Create issues for bugs or feature requests

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-widget-slot`)
3. Commit changes (`git commit -m 'Add new widget slot'`)
4. Push to branch (`git push origin feature/new-widget-slot`)
5. Create Pull Request

---

## 🎉 Example: Complete Widget Package

Here's a complete example of a widget package:

```tsx
// @sportsbet/live-events/src/LiveEventsWidget.tsx
import React, { useState, useEffect } from "react";

export interface LiveEventsProps {
  locale: string;
  maxEvents?: number;
  sports?: string[];
  autoRefresh?: boolean;
  onEventClick?: (eventId: string) => void;
}

const LiveEventsWidget: React.FC<LiveEventsProps> = ({
  locale,
  maxEvents = 5,
  sports = ["football"],
  autoRefresh = true,
  onEventClick,
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();

    if (autoRefresh) {
      const interval = setInterval(fetchEvents, 30000);
      return () => clearInterval(interval);
    }
  }, [sports, autoRefresh]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `/api/live-events?sports=${sports.join(",")}&locale=${locale}`,
      );
      const data = await response.json();
      setEvents(data.slice(0, maxEvents));
    } catch (error) {
      console.error("Failed to fetch live events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onEventClick?.(event.id)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div>
              <div className="font-semibold text-gray-900">{event.teams}</div>
              <div className="text-sm text-gray-600">{event.league} • LIVE</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900">{event.score}</div>
            <div className="text-sm text-green-600">{event.odds}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveEventsWidget;
```

```json
// @sportsbet/live-events/package.json
{
  "name": "@sportsbet/live-events",
  "version": "1.0.0",
  "description": "Live sports events widget for sports betting platform",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "rollup": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

This complete example shows how to create a production-ready widget package that integrates seamlessly with the Web Shell platform.

Happy coding! 🚀
