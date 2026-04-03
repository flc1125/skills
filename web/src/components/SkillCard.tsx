'use client';

import { useEffect, useRef } from 'react';
import { SkillMetadata } from '@/lib/skills';
import { motion } from 'framer-motion';
import { CalendarDays, Files, Terminal } from 'lucide-react';
import { formatSkillPublishedAt } from '@/lib/utils';
import { trackEvent } from '@/lib/gtag';

interface SkillCardProps {
  skill: SkillMetadata;
  position: number;
  onClick: (skill: SkillMetadata) => void;
}

export function SkillCard({ skill, position, onClick }: SkillCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedImpression = useRef(false);
  const displayName = skill.metadata?.name ?? skill.name;
  const displayDescription = skill.metadata?.description ?? skill.description;
  const publishedAt = formatSkillPublishedAt(skill.metadata?.created);
  const fileCountLabel = `${skill.fileCount} ${skill.fileCount === 1 ? 'file' : 'files'}`;

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
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className="group flex h-full cursor-pointer flex-col rounded-[1.35rem] border border-gray-200/70 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:border-gray-300/80 hover:shadow-[0_28px_60px_-34px_rgba(15,23,42,0.5)] dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[1.05rem] font-bold leading-tight tracking-[-0.02em] text-gray-950 transition-colors group-hover:text-black dark:text-gray-50 dark:group-hover:text-white">
            {displayName}
          </h3>
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full bg-gray-100/70 px-2 py-0.5 text-[10px] font-medium lowercase tracking-[0.08em] text-gray-400 dark:bg-gray-800/70 dark:text-gray-500">
              {skill.name}
            </span>
          </div>
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-colors group-hover:border-gray-300 group-hover:bg-gray-100 group-hover:text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:group-hover:border-gray-700 dark:group-hover:bg-gray-900 dark:group-hover:text-gray-200">
          <Terminal size={15} strokeWidth={1.75} />
        </div>
      </div>
      
      <p className="flex-grow text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {displayDescription}
      </p>

      {(publishedAt || skill.fileCount > 0) ? (
        <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-3 text-[12px] font-medium text-gray-400/90 dark:border-gray-800 dark:text-gray-500">
          {publishedAt ? (
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} className="flex-shrink-0" />
              <span>{publishedAt}</span>
            </div>
          ) : null}
          {skill.fileCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <Files size={12} className="flex-shrink-0" />
              <span>{fileCountLabel}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
