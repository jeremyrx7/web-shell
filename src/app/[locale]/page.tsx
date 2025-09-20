'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PuzzlePieceIcon,
  ChartBarIcon,
  CubeIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const features = [
    {
      name: 'Widget Integration',
      description: 'Seamlessly embed widgets from the widget library into your pages.',
      icon: PuzzlePieceIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Multi-language Support',
      description: 'Built-in internationalization support for English and French.',
      icon: SparklesIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Island Architecture',
      description: 'Dedicated spaces for widget placement while maintaining layout consistency.',
      icon: CubeIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Real-time Analytics',
      description: 'Monitor widget performance and user interactions.',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
    },
  ];

  const widgetIslands = [
    {
      name: 'Hero Section',
      description: 'Main banner area perfect for promotional widgets',
      status: 'active',
      color: 'green',
    },
    {
      name: 'Features Grid',
      description: 'Showcase product features with interactive widgets',
      status: 'active',
      color: 'blue',
    },
    {
      name: 'Testimonials',
      description: 'Customer feedback and review widgets',
      status: 'pending',
      color: 'purple',
    },
    {
      name: 'Full Page',
      description: 'Entire page dedicated to a single widget',
      status: 'draft',
      color: 'red',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          {t('pages.home.title')}
        </h1>
        <p className="text-xl text-blue-100 mb-6 max-w-2xl">
          {t('pages.home.subtitle')}
        </p>
        <div className="flex space-x-4">
          <Link
            href={`/${locale}/widgets`}
            className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <span>Explore Widgets</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href={`/${locale}/islands/hero`}
            className="border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            View Islands
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Islands Status */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Widget Islands</h2>
          <Link
            href={`/${locale}/islands`}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {widgetIslands.map((island) => (
            <div
              key={island.name}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`h-3 w-3 bg-${island.color}-400 rounded-full`}></div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {island.name}
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    island.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : island.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {island.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {island.description}
              </p>
              <Link
                href={`/${locale}/islands/${island.name.toLowerCase().replace(' ', '-')}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Configure Island →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Available Widgets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-sm text-gray-600">Active Islands</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <div className="text-sm text-gray-600">Languages</div>
          </div>
        </div>
      </div>
    </div>
  );
}
