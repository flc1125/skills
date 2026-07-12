'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, MotionConfig } from 'framer-motion';
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
    <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10">
      <section className="relative grid min-h-[42rem] gap-10 border-b border-[var(--rule)] py-12 md:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] md:items-center lg:gap-16 lg:py-14">
        <div className="signal-orbit" aria-hidden="true" />

        <div className="relative z-10 min-w-0 max-w-3xl">
          <h1 className="font-display text-[clamp(3.4rem,5.2vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.06em] text-[var(--foreground)]">
            Find the right skill.
            <br />
            Start with the <span className="text-[var(--accent)]">exact workflow.</span>
          </h1>
          <p className="mt-7 max-w-[38rem] text-base leading-8 text-[var(--muted)] sm:text-lg">
            A curated atlas of reusable agent workflows—built to turn repeatable engineering, research, and knowledge tasks into precise operating systems.
          </p>

          <div className="mt-8 flex h-16 max-w-[38rem] items-center border border-[var(--rule-strong)] bg-[color-mix(in_srgb,var(--background)_82%,transparent)] shadow-[0_20px_55px_-34px_rgba(0,0,0,0.55)]">
            <span className="grid h-full w-16 shrink-0 place-items-center border-r border-[var(--rule)] text-[var(--signal)]" aria-hidden="true">
              <Search size={20} strokeWidth={1.5} />
            </span>
            <label htmlFor="skill-search" className="sr-only">Search catalog</label>
            <input
              ref={searchInputRef}
              id="skill-search"
              type="search"
              placeholder="Search skills by name or workflow"
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] sm:text-base"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <span className="hidden h-full shrink-0 place-items-center border-l border-[var(--rule)] px-4 font-mono text-[11px] text-[var(--muted)] sm:grid">⌘ K</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-10 gap-y-3" aria-label="Collection facts">
            <div className="flex items-baseline gap-3">
              <strong className="font-display text-2xl font-extrabold text-[var(--accent)]">{totalSkills}</strong>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">skills mapped</span>
            </div>
            <div className="flex items-baseline gap-3">
              <strong className="font-display text-2xl font-extrabold text-[var(--accent)]">{totalFiles}</strong>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">source files</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 min-w-0">
          <RepositoryInstallPanel />
        </div>
      </section>

      <section className="catalog-band py-12 sm:py-16" aria-labelledby="catalog-heading">
        <div className="grid gap-4 border-b border-[var(--rule-strong)] pb-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h2 id="catalog-heading" className="font-display text-4xl font-extrabold tracking-[-0.045em] text-[var(--foreground)]">
              Browse skills
            </h2>
            <p className="text-sm text-[var(--muted)]" aria-live="polite">
              {String(orderedSkills.length).padStart(2, '0')} visible records
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Newest signal first
          </p>
        </div>

        <MotionConfig reducedMotion="user">
          <div>
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
        </MotionConfig>

        {orderedSkills.length === 0 ? (
          <div className="border-b border-[var(--rule)] py-16">
            <div className="mb-5 h-2 w-2 rotate-45 border border-[var(--accent)] shadow-[0_0_14px_color-mix(in_srgb,var(--accent)_60%,transparent)]" />
            <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-[var(--foreground)]">No matching signal</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              Try a broader workflow, tool, or outcome to restore the atlas.
            </p>
          </div>
        ) : null}
      </section>

      <SkillModal
        skill={activeSelectedSkill}
        isOpen={isModalOpen}
        isLoading={isLoadingSkill}
        error={skillLoadError}
        onClose={handleCloseModal}
      />
    </div>
  );
}
