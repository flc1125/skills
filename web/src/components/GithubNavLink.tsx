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
      className="inline-flex h-10 min-w-10 items-center justify-center gap-1.5 border border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface)_66%,transparent)] px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] hover:text-[var(--foreground)] xl:h-11 xl:min-w-11 xl:px-3"
    >
      <Icons.Github size={14} />
      <span className="hidden xl:inline">GitHub</span>
    </a>
  );
}
