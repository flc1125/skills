'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { Variants } from 'motion/react';
import { Search } from 'lucide-react';
import { RepositoryInstallPanel } from './RepositoryInstallPanel';
import { SkillCard } from './SkillCard';
import { trackEvent } from '@/lib/gtag';
import { formatInteractionCount, parseSkillMetadataDate } from '@/lib/utils';
import type { SkillMetadata } from '@/lib/skills';
import { useStats } from './StatsProvider';

interface MarketplaceProps {
  initialSkills: SkillMetadata[];
}

function compareSkillsByCreated(left: SkillMetadata, right: SkillMetadata) {
  const leftTime = parseSkillMetadataDate(left.metadata?.created)?.getTime() ?? 0;
  const rightTime = parseSkillMetadataDate(right.metadata?.created)?.getTime() ?? 0;

  if (leftTime !== rightTime) {
    return rightTime - leftTime;
  }

  return left.name.localeCompare(right.name);
}

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 26 } },
};

const defaultNumberFormat = (value: number) => value.toString();

function AnimatedNumber({
  value,
  format = defaultNumberFormat,
}: {
  value: number;
  format?: (value: number) => string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    format(Math.round(latest))
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: shouldReduceMotion ? 0 : 0.7,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [motionValue, shouldReduceMotion, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function Marketplace({ initialSkills }: MarketplaceProps) {
  const router = useRouter();
  const { snapshot: statsSnapshot } = useStats();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastTrackedSearch = useRef<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const orderedSkills = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return initialSkills
      .filter((skill) => {
        const displayName = skill.metadata?.name ?? skill.name;
        const displayDescription = skill.metadata?.description ?? skill.description;

        return (
          displayName.toLowerCase().includes(normalizedSearch) ||
          displayDescription.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort(compareSkillsByCreated);
  }, [initialSkills, search]);

  const totalSkills = initialSkills.length;
  const isSearching = search.trim().length > 0;
  const totalFiles = useMemo(
    () => initialSkills.reduce((sum, skill) => sum + skill.fileCount, 0),
    [initialSkills]
  );
  const totalInteractions = useMemo(() => {
    if (!statsSnapshot.enabled) {
      return null;
    }

    return Object.values(statsSnapshot.skills).reduce(
      (totals, stats) => ({
        views: totals.views + stats.views,
        copies: totals.copies + stats.copies,
      }),
      { views: 0, copies: 0 }
    );
  }, [statsSnapshot]);

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      lastTrackedSearch.current = null;
      return;
    }

    const fingerprint = `${query.toLowerCase()}::${orderedSkills.length}`;

    if (lastTrackedSearch.current === fingerprint) {
      return;
    }

    const timeout = window.setTimeout(() => {
      trackEvent('skill_search', {
        query,
        result_count: orderedSkills.length,
      });
      lastTrackedSearch.current = fingerprint;
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [orderedSkills.length, search]);

  const handleCardClick = (skillMeta: SkillMetadata) => {
    router.push(`/${skillMeta.slug}`, { scroll: false });
  };

  return (
    <MotionConfig reducedMotion="user">
    <motion.div
      variants={heroContainer}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl px-5 sm:px-8"
    >
      <section className="mx-auto max-w-3xl pb-14 pt-16 text-center sm:pt-24">
        <motion.h1 variants={heroItem} className="font-display text-[clamp(2.6rem,6vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--foreground)]">
          Find your next
          <span className="text-[var(--accent)]"> workflow.</span>
        </motion.h1>
        <motion.p variants={heroItem} className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
          Reusable skills for your AI agents. Turn repeatable engineering, research, and knowledge tasks into one-command workflows.
        </motion.p>

        <motion.div variants={heroItem} className="mx-auto mt-9 max-w-xl">
          <div className="flex h-14 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] pl-5 pr-2 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,scale] duration-200 focus-within:scale-[1.02] focus-within:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] focus-within:shadow-[var(--shadow-card-hover)]">
          <Search size={18} strokeWidth={1.8} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
          <label htmlFor="skill-search" className="sr-only">Search catalog</label>
          <input
            ref={searchInputRef}
            id="skill-search"
            type="search"
            placeholder="Search skills by name or workflow"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] sm:text-base"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="hidden h-9 shrink-0 items-center rounded-full bg-[var(--surface-muted)] px-3 font-mono text-[11px] text-[var(--muted)] sm:flex">⌘ K</span>
          </div>
        </motion.div>

        <motion.div variants={heroItem} className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Collection facts">
          <span className="inline-flex h-8 items-center rounded-full bg-[var(--surface-muted)] px-3.5 text-xs font-medium leading-none text-[var(--muted)]">
            <strong className="mr-1.5 font-display font-bold leading-none text-[var(--foreground)]"><AnimatedNumber value={totalSkills} /></strong> skills
          </span>
          <span className="inline-flex h-8 items-center rounded-full bg-[var(--surface-muted)] px-3.5 text-xs font-medium leading-none text-[var(--muted)]">
            <strong className="mr-1.5 font-display font-bold leading-none text-[var(--foreground)]"><AnimatedNumber value={totalFiles} /></strong> files
          </span>
          {totalInteractions ? (
            <>
              <span
                className="inline-flex h-8 items-center rounded-full bg-[var(--surface-muted)] px-3.5 text-xs font-medium leading-none text-[var(--muted)]"
                title={`${totalInteractions.views.toLocaleString('en')} views`}
              >
                <strong className="mr-1.5 font-display font-bold leading-none text-[var(--foreground)]"><AnimatedNumber value={totalInteractions.views} format={formatInteractionCount} /></strong> views
              </span>
              <span
                className="inline-flex h-8 items-center rounded-full bg-[var(--surface-muted)] px-3.5 text-xs font-medium leading-none text-[var(--muted)]"
                title={`${totalInteractions.copies.toLocaleString('en')} copies`}
              >
                <strong className="mr-1.5 font-display font-bold leading-none text-[var(--foreground)]"><AnimatedNumber value={totalInteractions.copies} format={formatInteractionCount} /></strong> copies
              </span>
            </>
          ) : null}
        </motion.div>
      </section>

      <motion.section variants={heroItem} className="mx-auto max-w-2xl">
        <AnimatePresence initial={false}>
          {!isSearching && (
            <motion.div
              key="quick-install-panel"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 64 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <RepositoryInstallPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <section className="pb-8" aria-labelledby="catalog-heading">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-6 flex flex-wrap items-end justify-between gap-3"
        >
          <h2 id="catalog-heading" className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Browse skills
          </h2>
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            {orderedSkills.length} {orderedSkills.length === 1 ? 'skill' : 'skills'}
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {orderedSkills.map((skill, index) => (
              <SkillCard
                key={skill.slug}
                skill={skill}
                stats={statsSnapshot.enabled ? statsSnapshot.skills[skill.slug] : undefined}
                position={index + 1}
                onClick={handleCardClick}
              />
            ))}
          </AnimatePresence>
        </div>

        {orderedSkills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border-strong)] py-16 text-center"
          >
            <motion.span
              initial={{ scale: 0.4, rotate: -14 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 13, delay: 0.08 }}
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)]"
            >
              <Search size={18} strokeWidth={1.8} />
            </motion.span>
            <h3 className="font-display mt-4 text-lg font-bold text-[var(--foreground)]">No matching skills</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Try a broader workflow, tool, or outcome.
            </p>
          </motion.div>
        ) : null}
      </section>
    </motion.div>
    </MotionConfig>
  );
}
