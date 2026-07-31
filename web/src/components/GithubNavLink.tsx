'use client';

import { MotionConfig, motion } from 'motion/react';
import { LuGithub } from 'react-icons/lu';
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
      <MotionConfig reducedMotion="user">
        <motion.span
          initial={{ rotate: -120, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24, delay: 0.08 }}
          className="grid place-items-center"
        >
          <LuGithub size={16} />
        </motion.span>
      </MotionConfig>
    </a>
  );
}
