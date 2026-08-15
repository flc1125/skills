'use client';

import { ExternalLink } from 'lucide-react';
import { trackEvent } from '@/lib/gtag';

interface SkillSourceLinkProps {
  url: string;
  slug: string;
  name: string;
}

export function SkillSourceLink({ url, slug, name }: SkillSourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackEvent('skill_source_click', {
          skill_slug: slug,
          skill_name: name,
          target: 'github_skill_source',
        });
      }}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      aria-label="View source on GitHub"
      title="View source on GitHub"
    >
      <ExternalLink size={16} strokeWidth={1.8} />
    </a>
  );
}
