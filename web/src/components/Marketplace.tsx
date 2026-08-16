'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { Variants } from 'motion/react';
import { Search } from 'lucide-react';
import { RepositoryInstallPanel } from './RepositoryInstallPanel';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { SortSelect } from './SortSelect';
import { trackEvent } from '@/lib/gtag';
import { formatInteractionCount } from '@/lib/utils';
import { DEFAULT_SORT_KEY, SORT_OPTIONS, getSkillComparator, isStatsSortKey, normalizeSortKey } from '@/lib/sorting';
import type { SortKey } from '@/lib/sorting';
import type { Skill, SkillMetadata } from '@/lib/skills';
import type { SkillStats, SkillStatsSnapshot } from '@/lib/skill-stats';

interface MarketplaceProps {
  initialSkills: SkillMetadata[];
  initialStats: SkillStatsSnapshot;
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

export function Marketplace({ initialSkills, initialStats }: MarketplaceProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSkillSlug = searchParams.get('skill');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastTrackedSearch = useRef<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoadingSkill, setIsLoadingSkill] = useState(false);
  const [skillLoadError, setSkillLoadError] = useState<string | null>(null);
  const [statsSnapshot, setStatsSnapshot] = useState(initialStats);
  const requestedSortKey = normalizeSortKey(searchParams.get('sort'));
  const sortKey: SortKey =
    isStatsSortKey(requestedSortKey) && !statsSnapshot.enabled
      ? DEFAULT_SORT_KEY
      : requestedSortKey;
  const visibleSortOptions = SORT_OPTIONS.filter(
    (option) => !option.requiresStats || statsSnapshot.enabled
  );
  // Hydration-safe mount flag without setState-in-effect: false during SSR
  // and the first client render, true afterwards.
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const activeSelectedSkill =
    selectedSkillSlug && selectedSkill?.slug === selectedSkillSlug ? selectedSkill : null;
  const selectedSkillMeta = selectedSkillSlug
    ? initialSkills.find((skill) => skill.slug === selectedSkillSlug) ?? null
    : null;
  const isModalOpen = hasMounted && selectedSkillSlug !== null;

  // Reset detail state when the selected slug changes or clears, using the
  // render-time adjustment pattern instead of an effect.
  const [prevSlug, setPrevSlug] = useState(selectedSkillSlug);
  if (prevSlug !== selectedSkillSlug) {
    setPrevSlug(selectedSkillSlug);
    setSelectedSkill(null);
    setIsLoadingSkill(false);
    setSkillLoadError(null);
  }

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
    if (!hasMounted || !selectedSkillSlug) {
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
      .sort(getSkillComparator(sortKey, statsSnapshot));
  }, [initialSkills, search, sortKey, statsSnapshot]);

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
    const params = new URLSearchParams(searchParams.toString());
    params.set('skill', skillMeta.slug);
    window.history.pushState(null, '', `${pathname}?${params.toString()}`);
  };

  const handleSortChange = (key: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === DEFAULT_SORT_KEY) {
      params.delete('sort');
    } else {
      params.set('sort', key);
    }
    const queryString = params.toString();
    window.history.pushState(null, '', `${pathname}${queryString ? `?${queryString}` : ''}`);
    trackEvent('skill_sort', { sort_key: key });
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
    setSkillLoadError(null);
    setIsLoadingSkill(false);
    window.history.pushState(null, '', pathname);
  };

  const handleStatsChange = useCallback((slug: string, stats: SkillStats) => {
    setStatsSnapshot((current) => ({
      enabled: true,
      skills: {
        ...current.skills,
        [slug]: stats,
      },
    }));
  }, []);

  // Reflect the open skill in the document title so shared ?skill= links
  // and browser tabs carry the skill name; closing always returns to the
  // homepage, so restore the known site title rather than a captured one
  // (which may itself be the skill title on direct ?skill= loads).
  useEffect(() => {
    const skillName = selectedSkillMeta?.metadata?.name ?? selectedSkillMeta?.name;

    if (!skillName) {
      return;
    }

    document.title = `${skillName} · Flc's Skills`;

    return () => {
      document.title = "Flc's Skills";
    };
  }, [selectedSkillMeta]);

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
          className="mb-6 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-baseline gap-2.5">
            <h2 id="catalog-heading" className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Browse skills
            </h2>
            <p className="text-sm text-[var(--muted)]" aria-live="polite">
              {orderedSkills.length} {orderedSkills.length === 1 ? 'skill' : 'skills'}
            </p>
          </div>
          <SortSelect value={sortKey} options={visibleSortOptions} onChange={handleSortChange} />
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

      <SkillModal
        skill={activeSelectedSkill}
        fallbackName={selectedSkillMeta ? selectedSkillMeta.metadata?.name ?? selectedSkillMeta.name : undefined}
        isOpen={isModalOpen}
        isLoading={isLoadingSkill}
        error={skillLoadError}
        stats={
          statsSnapshot.enabled && selectedSkillSlug
            ? statsSnapshot.skills[selectedSkillSlug]
            : undefined
        }
        onStatsChange={handleStatsChange}
        onClose={handleCloseModal}
      />
    </motion.div>
    </MotionConfig>
  );
}
