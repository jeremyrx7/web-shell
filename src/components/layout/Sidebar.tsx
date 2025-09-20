'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  PuzzlePieceIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  PuzzlePieceIcon as PuzzlePieceIconSolid,
  CogIcon as CogIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from '@heroicons/react/24/solid';

const Sidebar = () => {
  const t = useTranslations();
  const pathname = usePathname();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  const navigation = [
    {
      name: t('navigation.home'),
      href: `/${locale}`,
      icon: HomeIcon,
      iconActive: HomeIconSolid,
      current: pathname === `/${locale}`,
    },
    {
      name: t('layout.sidebar.widgets'),
      href: `/${locale}/widgets`,
      icon: PuzzlePieceIcon,
      iconActive: PuzzlePieceIconSolid,
      current: pathname.startsWith(`/${locale}/widgets`),
    },
    {
      name: t('navigation.dashboard'),
      href: `/${locale}/dashboard`,
      icon: ChartBarIcon,
      iconActive: ChartBarIconSolid,
      current: pathname.startsWith(`/${locale}/dashboard`),
    },
    {
      name: 'Pages',
      href: `/${locale}/pages`,
      icon: DocumentTextIcon,
      iconActive: DocumentTextIconSolid,
      current: pathname.startsWith(`/${locale}/pages`),
    },
    {
      name: t('navigation.about'),
      href: `/${locale}/about`,
      icon: UserGroupIcon,
      iconActive: UserGroupIconSolid,
      current: pathname.startsWith(`/${locale}/about`),
    },
  ];

  const secondaryNavigation = [
    {
      name: t('layout.sidebar.settings'),
      href: `/${locale}/settings`,
      icon: CogIcon,
      iconActive: CogIconSolid,
      current: pathname.startsWith(`/${locale}/settings`),
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 pt-16">
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.current ? item.iconActive : item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Widget Islands Section */}
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Widget Islands
            </h3>
            <div className="mt-2 space-y-1">
              <Link
                href={`/${locale}/islands/hero`}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="mr-3 h-2 w-2 bg-green-400 rounded-full flex-shrink-0" />
                Hero Section
              </Link>
              <Link
                href={`/${locale}/islands/features`}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="mr-3 h-2 w-2 bg-blue-400 rounded-full flex-shrink-0" />
                Features Grid
              </Link>
              <Link
                href={`/${locale}/islands/testimonials`}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="mr-3 h-2 w-2 bg-purple-400 rounded-full flex-shrink-0" />
                Testimonials
              </Link>
              <Link
                href={`/${locale}/islands/full-page`}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="mr-3 h-2 w-2 bg-red-400 rounded-full flex-shrink-0" />
                Full Page Widget
              </Link>
            </div>
          </div>
        </nav>

        {/* Secondary Navigation */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.current ? item.iconActive : item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Widget Library Status */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Widget Library</span>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-green-600">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
