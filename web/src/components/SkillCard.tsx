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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22 }}
      onClick={handleClick}
      className="group flex h-full cursor-pointer flex-col rounded-[1.5rem] border border-black/5 bg-white/80 p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.55)] backdrop-blur transition-all hover:border-[#9ce6d2] hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:hover:border-[#8ddfc9]/50 dark:hover:bg-white/[0.075]"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[1.05rem] font-bold leading-tight text-[#14161b] transition-colors group-hover:text-black dark:text-white">
            {displayName}
          </h3>
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full bg-[#edf7f4] px-2.5 py-1 text-[10px] font-semibold lowercase text-[#2d8c75] dark:bg-emerald-300/10 dark:text-[#8ddfc9]">
              {skill.name}
            </span>
          </div>
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-black/5 bg-[#f4f8fb] text-[#5e6b7d] transition-colors group-hover:bg-black group-hover:text-white dark:border-white/10 dark:bg-white/[0.08] dark:text-[#aeb7c6] dark:group-hover:bg-white dark:group-hover:text-black">
          <Terminal size={15} strokeWidth={1.75} />
        </div>
      </div>
      
      <p className="flex-grow text-sm leading-relaxed text-[#687586] dark:text-[#aeb7c6]">
        {displayDescription}
      </p>

      {(publishedAt || skill.fileCount > 0) ? (
        <div className="mt-6 flex items-center gap-3 border-t border-black/5 pt-3 text-[12px] font-medium text-[#8792a2] dark:border-white/10 dark:text-[#8f99aa]">
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
