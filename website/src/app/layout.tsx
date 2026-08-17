import { Metadata } from 'next';
import React from 'react';
import { ThemeProvider } from '../ThemeContext';
import { WorkerContextProvider } from './WorkerContext';
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set the theme before first paint to avoid a flash of the wrong theme. */}
        <script>{`(function(){try{var t=localStorage.getItem('immutable-theme')||'auto';var d=t==='dark'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}})()`}</script>
      </head>
      <body>
        <ThemeProvider>
          <WorkerContextProvider>{children}</WorkerContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
