'use client';

import * as Icons from 'lucide-react';
import { trackEvent } from '@/lib/gtag';

const GITHUB_REPO_URL = 'https://github.com/flc1125/skills';

export function GithubNavLink() {
  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View project on GitHub"
      onClick={() => {
        trackEvent('nav_github_click', {
          target: 'github_repo',
          location: 'header',
        });
      }}
      className="inline-flex h-11 min-w-11 items-center gap-2 border border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface)_66%,transparent)] px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] hover:text-[var(--foreground)]"
    >
      <Icons.Github size={15} />
      <span className="hidden sm:inline">GitHub</span>
    </a>
  );
}
