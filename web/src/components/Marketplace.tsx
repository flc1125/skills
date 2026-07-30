'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { Variants } from 'motion/react';
import { Search } from 'lucide-react';
import { RepositoryInstallPanel } from './RepositoryInstallPanel';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { trackEvent } from '@/lib/gtag';
import { parseSkillMetadataDate } from '@/lib/utils';
import type { Skill, SkillMetadata } from '@/lib/skills';

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

function AnimatedNumber({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSkillSlug = searchParams.get('skill');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastTrackedSearch = useRef<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoadingSkill, setIsLoadingSkill] = useState(false);
  const [skillLoadError, setSkillLoadError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const activeSelectedSkill =
    selectedSkillSlug && selectedSkill?.slug === selectedSkillSlug ? selectedSkill : null;
  const isModalOpen = hasMounted && selectedSkillSlug !== null;

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    if (!selectedSkillSlug) {
      setSelectedSkill(null);
      setIsLoadingSkill(false);
      setSkillLoadError(null);
      return;
    }

    let cancelled = false;

    const fetchSkill = async () => {
      setIsLoadingSkill(true);
      setSkillLoadError(null);

      try {
        const response = await fetch(`/api/skills/${selectedSkillSlug}`);

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Skill not found.' : 'Failed to load skill details.');
        }

        const data = await response.json();

        if (!cancelled) {
          setSelectedSkill(data);
        }
      } catch (error) {
        console.error('Failed to fetch skill details:', error);

        if (!cancelled) {
          setSelectedSkill(null);
          setSkillLoadError(error instanceof Error ? error.message : 'Failed to load skill details.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSkill(false);
        }
      }
    };

    fetchSkill();

    return () => {
      cancelled = true;
    };
  }, [hasMounted, selectedSkillSlug]);

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
  const totalFiles = useMemo(
    () => initialSkills.reduce((sum, skill) => sum + skill.fileCount, 0),
    [initialSkills]
  );

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
    const params = new URLSearchParams(searchParams.toString());
    params.set('skill', skillMeta.slug);
    window.history.pushState(null, '', `${pathname}?${params.toString()}`);
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
    setSkillLoadError(null);
    setIsLoadingSkill(false);
    window.history.pushState(null, '', pathname);
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
          A curated collection of reusable agent skills—turn repeatable engineering, research, and knowledge tasks into one-command workflows.
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
          <span className="inline-flex h-8 items-center rounded-full bg-[var(--surface-muted)] px-3.5 text-xs font-medium text-[var(--muted)]">
            <strong className="mr-1.5 font-display font-bold text-[var(--foreground)]"><AnimatedNumber value={totalSkills} /></strong> skills
          </span>
          <span className="inline-flex h-8 items-center rounded-full bg-[var(--surface-muted)] px-3.5 text-xs font-medium text-[var(--muted)]">
            <strong className="mr-1.5 font-display font-bold text-[var(--foreground)]"><AnimatedNumber value={totalFiles} /></strong> source files
          </span>
          <span className="inline-flex h-8 items-center rounded-full bg-[var(--surface-muted)] px-3.5 text-xs font-medium text-[var(--muted)]">
            One command to install
          </span>
        </motion.div>
      </section>

      <motion.section variants={heroItem} className="mx-auto max-w-2xl pb-16">
        <RepositoryInstallPanel />
      </motion.section>

      <section className="pb-8" aria-labelledby="catalog-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="catalog-heading" className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Browse skills
          </h2>
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            {orderedSkills.length} {orderedSkills.length === 1 ? 'skill' : 'skills'} · newest first
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {orderedSkills.map((skill, index) => (
              <SkillCard
                key={skill.slug}
                skill={skill}
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

      <SkillModal
        skill={activeSelectedSkill}
        isOpen={isModalOpen}
        isLoading={isLoadingSkill}
        error={skillLoadError}
        onClose={handleCloseModal}
      />
    </motion.div>
    </MotionConfig>
  );
}
