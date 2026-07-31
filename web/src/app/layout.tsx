import type { Metadata } from "next";
import { Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { GaPageViewTracker } from '@/components/GaPageViewTracker';
import { GithubNavLink } from '@/components/GithubNavLink';
import { HeaderShell } from '@/components/HeaderShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandMark } from '@/components/BrandMark';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const GA_MEASUREMENT_ID = 'G-GYPECK2498';

export const metadata: Metadata = {
  metadataBase: new URL('https://skills.flc.io'),
  title: "Flc's Skills",
  description: "A catalog of reusable agent workflow skills.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: "Flc's Skills",
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: "Flc's Skills — Reusable workflow skills for agents",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
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
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
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
        <HeaderShell>
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3 outline-none transition-opacity hover:opacity-80"
              aria-label="Go to homepage"
            >
              <BrandMark className="h-8 w-8 shrink-0" />
              <span className="font-display min-w-0 text-lg font-bold tracking-tight text-[var(--foreground)]">
                Flc&apos;s Skills
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              <ThemeToggle />
              <GithubNavLink />
            </nav>
          </div>
        </HeaderShell>
        <main className="pt-16">{children}</main>
        <footer className="mt-12 border-t border-[var(--border)] py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 text-center sm:px-8">
            <p className="font-display text-sm font-bold text-[var(--foreground)]">Flc&apos;s Skills</p>
            <p className="max-w-md text-xs leading-5 text-[var(--muted)]">
              Reusable workflow skills for agents that need clearer operating rules and repeatable outcomes.
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              © 2026{' '}
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
