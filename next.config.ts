import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // Enable external packages from widget library
    externalDir: true,
  },
  transpilePackages: [
    // Add widget packages here as they're published
    "@widget-library/core",
  ],
  images: {
    domains: [
      // Add your Strapi domain here
      "localhost",
      "your-strapi-domain.com",
    ],
  },
  env: {
    STRAPI_API_URL: process.env.STRAPI_API_URL || "http://localhost:1337",
    STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
  },
  webpack: (config, { isServer }) => {
    // Allow dynamic imports for widgets
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        widgets: {
          test: /[\\/]node_modules[\\/]@widget-library[\\/]/,
          name: "widgets",
          chunks: "all",
          priority: 10,
        },
      },
    };

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
