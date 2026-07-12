'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Files } from 'lucide-react';
import { trackEvent } from '@/lib/gtag';
import { formatSkillPublishedAt } from '@/lib/utils';
import type { SkillMetadata } from '@/lib/skills';

interface SkillCardProps {
  skill: SkillMetadata;
  position: number;
  onClick: (skill: SkillMetadata) => void;
}

export function SkillCard({ skill, position, onClick }: SkillCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const hasTrackedImpression = useRef(false);
  const displayName = skill.metadata?.name ?? skill.name;
  const displayDescription = skill.metadata?.description ?? skill.description;
  const publishedAt = formatSkillPublishedAt(skill.metadata?.created);

  useEffect(() => {
    const element = cardRef.current;

    if (!element || hasTrackedImpression.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasTrackedImpression.current) {
            return;
          }

          hasTrackedImpression.current = true;
          trackEvent('skill_list_impression', {
            skill_slug: skill.slug,
            skill_name: displayName,
            position,
            list_type: 'marketplace_grid',
          });
          observer.disconnect();
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [displayName, position, skill.slug]);

  const handleClick = () => {
    trackEvent('skill_card_click', {
      skill_slug: skill.slug,
      skill_name: displayName,
      position,
      source: 'marketplace_grid',
    });
    onClick(skill);
  };

  return (
    <motion.button
      ref={cardRef}
      type="button"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      onClick={handleClick}
      className="group relative grid min-h-32 w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--rule)] px-1 py-6 text-left transition-colors hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent)_7%,transparent),transparent_74%)] sm:grid-cols-[3rem_minmax(0,1fr)_12rem_8rem] sm:gap-6"
    >
      <span className="grid place-items-center" aria-hidden="true">
        <span className="h-2 w-2 rotate-45 border border-[var(--rule-strong)] transition-all group-hover:border-[var(--accent)] group-hover:shadow-[0_0_14px_color-mix(in_srgb,var(--accent)_72%,transparent)]" />
      </span>

      <span className="min-w-0">
        <span className="font-display block text-xl font-extrabold tracking-[-0.025em] text-[var(--foreground)] sm:text-2xl">
          {displayName}
        </span>
        <span className="mt-2 block max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {displayDescription}
        </span>
        <span className="mt-3 inline-flex font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--signal)] sm:hidden">
          {skill.installName}
        </span>
      </span>

      <span className="hidden min-w-0 sm:block">
        <span className="flex items-center gap-2 font-mono text-[10px] text-[var(--muted)]">
          <CalendarDays size={13} strokeWidth={1.5} />
          {publishedAt ?? 'Uncalibrated'}
        </span>
        <span className="mt-2 flex items-center gap-2 font-mono text-[10px] text-[var(--muted)]">
          <Files size={13} strokeWidth={1.5} />
          {skill.fileCount} {skill.fileCount === 1 ? 'file' : 'files'}
        </span>
      </span>

      <span className="flex items-center gap-2 justify-self-end text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
        <span className="hidden lg:inline">View skill</span>
        <ArrowRight size={18} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
}
