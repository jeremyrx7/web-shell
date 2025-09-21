"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 lg:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link href="/" className="text-lg font-bold text-blue-600">
              Web Shell
            </Link>
            <span className="text-sm text-gray-500">© 2025</span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-blue-600">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-blue-600">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
