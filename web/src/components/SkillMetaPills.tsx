'use client';

import { CalendarDays, Copy, Eye, Files } from 'lucide-react';
import { formatInteractionCount, formatSkillPublishedAt } from '@/lib/utils';
import type { Skill } from '@/lib/skills';
import { useStats } from './StatsProvider';

export function SkillMetaPills({ skill }: { skill: Skill }) {
  const { snapshot } = useStats();
  const stats = snapshot.enabled ? snapshot.skills[skill.slug] : undefined;
  const publishedAt = formatSkillPublishedAt(skill.metadata?.created);
  const fileCountLabel = `${skill.fileCount} ${skill.fileCount === 1 ? 'file' : 'files'}`;

  return (
    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 font-mono text-xs">
      <span className="inline-flex h-7 max-w-full items-center rounded-full bg-[var(--surface-muted)] px-3 text-[var(--muted)]">
        {skill.name}
      </span>
      {publishedAt ? (
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 text-[var(--muted)]">
          <CalendarDays size={12} strokeWidth={1.5} className="shrink-0" />
          {publishedAt}
        </span>
      ) : null}
      <span className="inline-flex min-h-7 flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[var(--muted)]">
        <span className="hidden items-center gap-1.5 min-[420px]:flex">
          <Files size={12} strokeWidth={1.5} className="shrink-0" />
          {fileCountLabel}
        </span>
        {stats ? (
          <>
            <span
              className="flex shrink-0 items-center gap-1.5"
              title={`${stats.views.toLocaleString('en')} views`}
            >
              <Eye size={12} strokeWidth={1.6} className="shrink-0" />
              {formatInteractionCount(stats.views)} views
            </span>
            <span
              className="flex shrink-0 items-center gap-1.5"
              title={`${stats.copies.toLocaleString('en')} copies`}
            >
              <Copy size={12} strokeWidth={1.6} className="shrink-0" />
              {formatInteractionCount(stats.copies)} copies
            </span>
          </>
        ) : null}
      </span>
    </div>
  );
}
