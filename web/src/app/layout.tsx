import type { Metadata } from "next";
import { Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { GaPageViewTracker } from '@/components/GaPageViewTracker';
import { GithubNavLink } from '@/components/GithubNavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandMark } from '@/components/BrandMark';
import "./globals.css";

const GA_MEASUREMENT_ID = 'G-GYPECK2498';

export const metadata: Metadata = {
  title: "Flc's Skills",
  description: "A catalog of reusable agent workflow skills.",
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
        <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--header)] backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-4 outline-none transition-opacity hover:opacity-80"
              aria-label="Go to homepage"
            >
              <BrandMark className="h-9 w-9 shrink-0" />
              <span className="font-display min-w-0 text-lg font-extrabold tracking-[-0.03em] text-[var(--foreground)] sm:text-xl">
                Flc&apos;s Skills
              </span>
            </Link>
            <nav>
              <div className="grid h-9 w-[73px] grid-cols-2 divide-x divide-[var(--rule)] border border-[var(--rule-strong)] bg-[color-mix(in_srgb,var(--surface)_58%,transparent)]">
                <ThemeToggle />
                <GithubNavLink />
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface)_74%,transparent)] py-10">
          <div className="mx-auto grid max-w-[1360px] gap-6 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-10">
            <div>
              <p className="font-display mb-2 text-lg font-extrabold tracking-[-0.02em] text-[var(--foreground)]">Flc&apos;s Skills</p>
              <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
                Reusable workflow skills for agents that need clearer operating rules and repeatable outcomes.
              </p>
            </div>
            <p className="text-xs text-[var(--muted)]">
              © 2026 Flc&apos;s Skills. Created by{' '}
              <a
                href="https://flc.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
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
