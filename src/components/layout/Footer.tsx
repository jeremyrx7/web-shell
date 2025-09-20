'use client';

import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('layout');

  return (
    <footer className="ml-64 bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {t('footer')}
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
