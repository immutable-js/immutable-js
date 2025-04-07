import { Metadata } from 'next';
import React from 'react';
import '../../styles/globals.css';
import '../../styles/prism-theme.css';

export const metadata: Metadata = {
  title: 'Immutable.js',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
