'use client';

import { ClerkProvider } from '@clerk/nextjs';

export function Providers({ children }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors',
          card: 'bg-white shadow-lg rounded-lg',
          headerTitle: 'text-2xl font-bold text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
          formFieldInput: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        }
      }}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
} 