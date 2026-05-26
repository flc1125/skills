import type { Metadata } from "next";
import { Suspense } from 'react';
import Link from 'next/link';
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
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1218]/78">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-2xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#8ddfc9]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0f1218]"
              aria-label="Go to homepage"
            >
              <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-[#111318] dark:text-white">Flc&apos;s Skills</span>
            </Link>
            <nav className="rounded-full border border-black/5 bg-white/80 p-1 shadow-[0_16px_50px_-36px_rgba(15,23,42,0.65)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.08]">
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-black/10 dark:bg-white/10"
                />
                <GithubNavLink />
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-black/5 py-12 mt-10 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-[#111318] dark:text-white font-bold mb-2">Flc&apos;s Skills</p>
            <p className="text-[#687586] dark:text-[#aeb7c6] text-sm">Reusable agent workflows in a calm interface.</p>
            <p className="text-[#9aa4b2] dark:text-[#6f7887] text-xs mt-4">
              © 2026 Flc&apos;s Skills. Created by{' '}
              <a
                href="https://flc.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#178a70] transition-colors hover:text-[#111318] dark:text-[#8ddfc9] dark:hover:text-white"
              >
                Flc
              </a>
              . All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
