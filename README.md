# 🌊 Web Shell - Widget Integration Platform

A powerful Next.js-based web application shell that seamlessly integrates widgets from the widget library. Built with TypeScript, Tailwind CSS, and modern web technologies.

## 🚀 Features

- **🧩 Dynamic Widget Loading**: Load and render widgets from the widget library at runtime
- **🌍 Multi-language Support**: Built-in internationalization with English and French
- **🏗️ Island Architecture**: Dedicated widget placement areas with flexible layouts
- **🎨 Theming System**: Consistent design system with light/dark mode support
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🔧 Strapi Integration**: Content management through Strapi CMS
- **⚡ Performance Optimized**: Code splitting, lazy loading, and caching
- **♿ Accessibility**: WCAG compliant with proper ARIA attributes
- **🔒 Security**: Content Security Policy and input validation

## 🏗️ Architecture

### Widget Islands

The shell provides several predefined "islands" where widgets can be embedded:

- **Hero Section**: Main banner area for promotional content
- **Features Grid**: Showcase product features with interactive widgets
- **Testimonials**: Customer feedback and review widgets
- **Full Page**: Entire pages dedicated to single widgets

### Components Structure

```
src/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── layout.tsx      # Locale-specific layout
│   │   ├── page.tsx        # Home page
│   │   ├── widgets/        # Widget gallery
│   │   └── islands/        # Widget island pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── layout/             # Header, sidebar, footer
│   └── widgets/            # Widget-related components
├── lib/
│   ├── strapi.ts          # Strapi API client
│   └── widgetLoader.ts    # Dynamic widget loading
└── middleware.ts          # i18n routing
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm 9+
- Strapi CMS instance (optional for development)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd web-shell
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.local.example .env.local
   ```

   Update the following variables:

   ```env
   STRAPI_API_URL=http://localhost:1337
   STRAPI_API_TOKEN=your_strapi_token
   WIDGET_LIBRARY_REGISTRY=https://npm.pkg.github.com
   WIDGET_LIBRARY_TOKEN=your_github_token
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Internationalization

The application supports multiple languages using `next-intl`:

- **English (en)**: Default language
- **French (fr)**: Secondary language

### Adding New Languages

1. Create translation files in `messages/`
2. Add locale to `i18n.ts`
3. Update middleware configuration
4. Add language switcher option

### Translation Structure

```json
{
  "navigation": {
    "home": "Home",
    "widgets": "Widgets"
  },
  "widgets": {
    "title": "Widget Gallery",
    "loading": "Loading widget..."
  }
}
```

## 🧩 Widget Integration

### Dynamic Widget Loading

Widgets are loaded dynamically from the widget library using the `WidgetLoader`:

```typescript
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';

<WidgetRenderer
  widget={widgetConfig}
  configuration={customConfig}
  locale={currentLocale}
  onError={handleError}
  onLoad={handleLoad}
/>
```

### Widget Configuration

Each widget can be configured through Strapi or directly in code:

```typescript
const widgetConfig = {
  name: "@widget-library/hero-banner",
  version: "1.0.0",
  configuration: {
    title: "Welcome to Our Platform",
    primaryCta: {
      text: "Get Started",
      url: "/signup",
    },
  },
};
```

### Error Handling

The shell provides comprehensive error handling for widget loading:

- **Load Errors**: Widget package not found
- **Config Errors**: Invalid configuration
- **Runtime Errors**: Widget execution failures

## 📊 Strapi CMS Integration

### Content Types

- **Widgets**: Widget definitions and configurations
- **Pages**: Page layouts with widget assignments
- **Widget Islands**: Island configurations and constraints

### API Usage

```typescript
import { StrapiAPI } from "@/lib/strapi";

// Get all widgets
const widgets = await StrapiAPI.getWidgets(locale);

// Get widget island
const island = await StrapiAPI.getWidgetIsland("hero-section");

// Update widget configuration
await StrapiAPI.updateWidget(widgetId, newConfig);
```

## 🎨 Theming

### Design System

The shell uses a consistent design system based on Tailwind CSS:

```typescript
const theme = {
  colors: {
    primary: "#3B82F6",
    secondary: "#6B7280",
    background: "#FFFFFF",
    surface: "#F9FAFB",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
  },
};
```

### Custom Styling

Override widget styles using CSS variables:

```css
:root {
  --widget-primary-color: #your-color;
  --widget-border-radius: 8px;
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/
├── components/
│   └── __tests__/          # Component tests
├── lib/
│   └── __tests__/          # Utility tests
└── __tests__/              # Integration tests
```

### Widget Testing

Mock widgets for testing:

```typescript
jest.mock("@/lib/widgetLoader", () => ({
  loadWidget: jest.fn().mockResolvedValue(MockWidget),
}));
```

## 📦 Build & Deployment

### Development Build

```bash
npm run build
npm start
```

### Production Deployment

The application is optimized for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Environment Variables

Required for production:

```env
STRAPI_API_URL=https://your-strapi.com
STRAPI_API_TOKEN=production_token
WIDGET_LIBRARY_REGISTRY=https://npm.pkg.github.com
WIDGET_LIBRARY_TOKEN=production_token
NEXTAUTH_URL=https://your-app.com
NEXTAUTH_SECRET=production_secret
```

## 🔧 Configuration

### Next.js Configuration

Key configuration in `next.config.ts`:

```typescript
{
  transpilePackages: [
    '@widget-library/core',
    '@widget-library/hero-banner'
  ],
  images: {
    domains: ['your-strapi-domain.com']
  }
}
```

### Widget Security

Content Security Policy for widgets:

```typescript
{
  headers: {
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-eval' *.unpkg.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
    `
  }
}
```

## 🔄 Widget Updates

### Automated Updates

When widgets are published, GitHub Actions automatically:

1. Creates a PR with updated dependencies
2. Generates preview deployment
3. Notifies team for review

### Manual Updates

```bash
# Update specific widget
npm install @widget-library/hero-banner@latest

# Update all widgets
npm update @widget-library/*
```

## 🐛 Troubleshooting

### Common Issues

**Widget not loading:**

- Check package is published to registry
- Verify configuration is valid
- Check browser console for errors

**Build failures:**

- Ensure all widget packages are in `transpilePackages`
- Check TypeScript compatibility
- Verify peer dependencies

**Performance issues:**

- Enable lazy loading for widgets
- Check bundle analyzer for large dependencies
- Use React.memo for heavy components

### Debug Mode

Enable debug logging:

```env
DEBUG=true
NODE_ENV=development
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and add tests
4. **Run tests**: `npm test`
5. **Submit pull request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code style
- **Prettier**: Code formatting
- **Tests**: Required for new features

## 📚 API Reference

### WidgetRenderer Props

```typescript
interface WidgetRendererProps {
  widget: Widget;
  configuration?: Record<string, any>;
  locale?: string;
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}
```

### Widget Island Props

```typescript
interface WidgetIslandProps {
  island: WidgetIsland;
  editable?: boolean;
  locale?: string;
  onWidgetAdd?: (widget: Widget) => void;
  onWidgetRemove?: (widgetId: number) => void;
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.yourapp.com](https://docs.yourapp.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/web-shell/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/web-shell/discussions)
- **Email**: support@yourapp.com

---

Built with ❤️ by the Web Shell Team
