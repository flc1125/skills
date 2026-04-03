import type { Metadata } from "next";
import { Suspense } from 'react';
import Script from 'next/script';
import { GaPageViewTracker } from '@/components/GaPageViewTracker';
import { GithubNavLink } from '@/components/GithubNavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import "./globals.css";

const GA_MEASUREMENT_ID = 'G-GYPECK2498';

export const metadata: Metadata = {
  title: "Flc's Skills",
  description: "A marketplace for skills and agents",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (() => {
      const storageKey = 'theme-preference';
      const root = document.documentElement;
      const storedTheme = localStorage.getItem(storageKey);
      const theme = storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
        ? storedTheme
        : 'system';
      const resolvedTheme = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;

      root.dataset.theme = theme;
      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.style.colorScheme = resolvedTheme;
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            window.gtag = gtag;
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>
      </head>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Suspense fallback={null}>
          <GaPageViewTracker />
        </Suspense>
        <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-xl tracking-tight">Flc&apos;s Skills</span>
            </div>
            <nav className="rounded-full border border-gray-200 bg-white/70 p-1 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/70">
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-gray-200 dark:bg-gray-700"
                />
                <GithubNavLink />
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-100 dark:border-gray-800 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-900 dark:text-white font-medium mb-2">Flc&apos;s Skills</p>
            <p className="text-gray-500 text-sm italic">Built with Codex and Gemini, designed for efficiency</p>
            <p className="text-gray-400 text-xs mt-4">© 2026 Flc&apos;s Skills. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
