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
      className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-gray-600 transition-colors hover:bg-white hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <Icons.Github size={15} />
      <span className="hidden sm:inline">Github</span>
    </a>
  );
}
