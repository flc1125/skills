'use client';

import { useEffect, useRef } from 'react';
import { SkillMetadata } from '@/lib/skills';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, Files } from 'lucide-react';
import { formatSkillPublishedAt } from '@/lib/utils';
import { trackEvent } from '@/lib/gtag';

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
  const fileCountLabel = `${skill.fileCount} ${skill.fileCount === 1 ? 'file' : 'files'}`;
  const indexLabel = String(position).padStart(2, '0');

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      onClick={handleClick}
      className="group relative flex h-full min-h-[17rem] cursor-pointer flex-col overflow-hidden border border-[var(--rule)] bg-[var(--surface)] text-left shadow-[var(--shadow-register)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_78%,var(--surface-muted))]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--rule)] px-5 py-4">
        <span className="font-mono text-xs font-semibold text-[var(--accent)]">{indexLabel}</span>
        <ArrowUpRight className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" size={16} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-black leading-tight tracking-[-0.045em] text-[var(--foreground)]">
          {displayName}
        </h3>
        <span className="mt-3 inline-flex w-fit max-w-full items-center border border-[var(--rule)] bg-[var(--background)] px-2.5 py-1 font-mono text-[11px] font-semibold lowercase text-[var(--accent)]">
          <span className="truncate">{skill.name}</span>
        </span>
        <p className="mt-5 flex-grow text-sm leading-7 text-[var(--muted)]">
          {displayDescription}
        </p>

        {(publishedAt || skill.fileCount > 0) ? (
          <div className="mt-6 grid grid-cols-1 gap-2 border-t border-[var(--rule)] pt-4 font-mono text-[11px] font-medium text-[var(--muted)] sm:grid-cols-2">
            {publishedAt ? (
              <div className="flex items-center gap-1.5">
                <CalendarDays size={12} className="flex-shrink-0" />
                <span>{publishedAt}</span>
              </div>
            ) : null}
            {skill.fileCount > 0 ? (
              <div className="flex items-center gap-1.5 sm:justify-end">
                <Files size={12} className="flex-shrink-0" />
                <span>{fileCountLabel}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.button>
  );
}
