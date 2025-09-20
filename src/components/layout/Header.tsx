'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const t = useTranslations('layout');
  const router = useRouter();
  const pathname = usePathname();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const currentLocale = pathname.split('/')[1] || 'en';

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageChange = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
    setIsLangMenuOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {t('header')}
            </h1>
          </div>

          {/* Right side - Language switcher */}
          <div className="flex items-center space-x-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span className="text-lg">{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-gray-100 transition-colors ${
                          currentLocale === language.code
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu placeholder */}
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
