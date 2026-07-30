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
      title="View project on GitHub"
      onClick={() => {
        trackEvent('nav_github_click', {
          target: 'github_repo',
          location: 'header',
        });
      }}
      className="grid h-9 w-9 place-items-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
    >
      <Icons.Github size={16} />
    </a>
  );
}
