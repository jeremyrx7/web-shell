import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales } from '../../../i18n';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 ml-64 pt-16">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
