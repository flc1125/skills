'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Terminal } from 'lucide-react';
import type { Skill } from '@/lib/skills';
import { trackEvent } from '@/lib/gtag';
import { recordSkillInteraction } from '@/lib/skill-stats-client';
import { useStats } from './StatsProvider';

export function SkillInstallAction({ skill }: { skill: Skill }) {
  const { patchSkillStats } = useStats();
  const [copied, setCopied] = useState(false);
  const trackedViewSlug = useRef<string | null>(null);
  const displayName = skill.metadata?.name ?? skill.name;
  const command = `npx skills add https://skills.flc.io --skill ${skill.installName}`;

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  useEffect(() => {
    if (trackedViewSlug.current === skill.slug) {
      return;
    }

    trackEvent('skill_detail_view', {
      skill_slug: skill.slug,
      skill_name: displayName,
      install_name: skill.installName,
    });
    void recordSkillInteraction(skill.slug, 'view').then((updatedStats) => {
      if (updatedStats) {
        patchSkillStats(skill.slug, updatedStats);
      }
    });
    trackedViewSlug.current = skill.slug;
  }, [displayName, patchSkillStats, skill]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);

      trackEvent('skill_install_copy', {
        skill_slug: skill.slug,
        skill_name: displayName,
        install_name: skill.installName,
      });
      setCopied(true);
      void recordSkillInteraction(skill.slug, 'copy').then((updatedStats) => {
        if (updatedStats) {
          patchSkillStats(skill.slug, updatedStats);
        }
      });
    } catch (error) {
      console.error('Failed to copy install command:', error);
    }
  };

  return (
    <>
      <p className="mb-2 text-xs font-medium text-[var(--muted)]">
        Install this skill
      </p>
      <div className="flex items-center gap-3 rounded-xl bg-[var(--surface-muted)] py-2.5 pl-4 pr-2">
        <Terminal size={15} className="shrink-0 text-[var(--accent)]" />
        <code className="min-w-0 flex-1 select-all truncate font-mono text-xs text-[var(--foreground)]">
          {command}
        </code>
        <motion.button
          onClick={copyToClipboard}
          type="button"
          whileTap={{ scale: 0.92 }}
          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-colors ${
            copied
              ? 'bg-[var(--accent)] text-[var(--on-accent)]'
              : 'bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-card)] hover:text-[var(--accent)]'
          }`}
        >
          <span className="grid">
            <span
              className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                copied ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}
            >
              <Check size={13} />
              <span>Copied</span>
            </span>
            <span
              className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                copied ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <Copy size={13} />
              <span>Copy</span>
            </span>
          </span>
        </motion.button>
      </div>
    </>
  );
}
