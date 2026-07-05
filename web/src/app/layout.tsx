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
        <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3 rounded-md outline-none transition-opacity hover:opacity-85"
              aria-label="Go to homepage"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]">
                <span className="font-mono text-sm font-semibold">FS</span>
              </div>
              <span className="min-w-0 text-base font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-lg">
                Flc&apos;s Skills
              </span>
            </Link>
            <nav className="border border-[var(--rule)] bg-[var(--surface)] p-1 shadow-[var(--shadow-register)]">
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-[var(--rule)]"
                />
                <GithubNavLink />
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-[var(--rule)] bg-[var(--surface)] py-10">
          <div className="mx-auto grid max-w-[1400px] gap-6 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
            <div>
              <p className="mb-2 font-semibold tracking-[-0.02em] text-[var(--foreground)]">Flc&apos;s Skills</p>
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
