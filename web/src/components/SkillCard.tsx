'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
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
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${spotlightX}px ${spotlightY}px, color-mix(in srgb, var(--accent) 7%, transparent), transparent 72%)`;
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 28, delay: Math.min(position, 12) * 0.035 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        spotlightX.set(event.clientX - rect.left);
        spotlightY.set(event.clientY - rect.top);
      }}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200 hover:border-[color-mix(in_srgb,var(--accent)_32%,var(--border))] hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-offset-[-3px]"
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <span className="font-display relative block text-base font-bold tracking-tight text-[var(--foreground)] transition-colors duration-200 group-hover:text-[var(--accent)]">
        {displayName}
      </span>
      <span className="mt-2 line-clamp-2 block text-sm leading-6 text-[var(--muted)]">
        {displayDescription}
      </span>

      <span className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="flex min-w-0 items-center gap-3 font-mono text-[11px] text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={12} strokeWidth={1.5} className="shrink-0" />
            <span className="truncate">{publishedAt ?? 'Undated'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Files size={12} strokeWidth={1.5} className="shrink-0" />
            {skill.fileCount} {skill.fileCount === 1 ? 'file' : 'files'}
          </span>
        </span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] transition-all duration-200 group-hover:bg-[var(--accent)] group-hover:text-[var(--on-accent)]">
          <ArrowRight size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-px" />
        </span>
      </span>
    </motion.button>
  );
}
