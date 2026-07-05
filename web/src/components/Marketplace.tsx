'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { SkillMetadata, Skill } from '@/lib/skills';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { RepositoryInstallPanel } from './RepositoryInstallPanel';
import { ArrowUpRight, Files, Github, Search, TerminalSquare } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { parseSkillMetadataDate } from '@/lib/utils';
import { trackEvent } from '@/lib/gtag';

interface MarketplaceProps {
  initialSkills: SkillMetadata[];
}

export function Marketplace({ initialSkills }: MarketplaceProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSkillSlug = searchParams.get('skill');
  
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoadingSkill, setIsLoadingSkill] = useState(false);
  const [skillLoadError, setSkillLoadError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const lastTrackedSearch = useRef<string | null>(null);
  const activeSelectedSkill =
    selectedSkillSlug && selectedSkill?.slug === selectedSkillSlug ? selectedSkill : null;
  const isModalOpen = hasMounted && selectedSkillSlug !== null;

  useEffect(() => {
    setHasMounted(true);
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

  const filteredSkills = useMemo(() => {
    return initialSkills.filter((skill) => {
      const displayName = skill.metadata?.name ?? skill.name;
      const displayDescription = skill.metadata?.description ?? skill.description;
      const matchesSearch = 
        displayName.toLowerCase().includes(search.toLowerCase()) ||
        displayDescription.toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });
  }, [initialSkills, search]);

  const totalSkills = initialSkills.length;
  const totalFiles = useMemo(
    () => initialSkills.reduce((sum, skill) => sum + skill.fileCount, 0),
    [initialSkills]
  );

  const orderedSkills = useMemo(() => {
    return [...filteredSkills].sort((left, right) => {
      const leftTime = parseSkillMetadataDate(left.metadata?.created)?.getTime() ?? 0;
      const rightTime = parseSkillMetadataDate(right.metadata?.created)?.getTime() ?? 0;

      if (leftTime !== rightTime) {
        return rightTime - leftTime;
      }

      return left.name.localeCompare(right.name);
    });
  }, [filteredSkills]);

  const recentSkills = orderedSkills.slice(0, 4);

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
    <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
      <section className="grid min-w-0 min-h-[calc(100dvh-4rem)] gap-10 border-b border-[var(--rule)] py-12 md:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.58fr)] md:items-center lg:py-16">
        <div className="min-w-0 max-w-3xl">
          <h1 className="max-w-4xl text-balance text-[clamp(3rem,8vw,7.5rem)] font-black leading-[0.9] tracking-[-0.075em] text-[var(--foreground)]">
            Agent skills, indexed for repeatable work.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Browse the skill set, inspect the source instructions, and copy exact install commands without breaking out of the catalog.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="https://github.com/flc1125/skills"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent('github_star_prompt_click', {
                  target: 'github_repository',
                  source: 'hero_star_prompt',
                });
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--foreground)] px-5 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
            >
              <Github size={16} />
              <span>Open repository</span>
              <ArrowUpRight size={15} />
            </a>
            <div className="grid grid-cols-2 border border-[var(--rule)] bg-[var(--surface)] text-sm shadow-[var(--shadow-register)] sm:min-w-72">
              <div className="border-r border-[var(--rule)] px-4 py-3">
                <p className="font-mono text-xl font-semibold text-[var(--foreground)]">{totalSkills}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">published skills</p>
              </div>
              <div className="px-4 py-3">
                <p className="font-mono text-xl font-semibold text-[var(--foreground)]">{totalFiles}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">source files</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="min-w-0 border border-[var(--rule)] bg-[var(--surface)] shadow-[var(--shadow-register)]">
          <div className="flex items-center justify-between border-b border-[var(--rule)] px-5 py-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">live index</p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">Newest records in this dataset</p>
            </div>
            <TerminalSquare className="text-[var(--accent)]" size={20} />
          </div>
          <div className="divide-y divide-[var(--rule)]">
            {recentSkills.map((skill, index) => (
              <button
                key={skill.slug}
                type="button"
                onClick={() => handleCardClick(skill)}
                className="grid w-full grid-cols-[auto_1fr] gap-4 px-5 py-4 text-left transition hover:bg-[var(--surface-muted)]"
              >
                <span className="font-mono text-xs text-[var(--accent)]">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                    {skill.metadata?.name ?? skill.name}
                  </span>
                  <span className="mt-1 block truncate font-mono text-xs text-[var(--muted)]">
                    {skill.installName}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-b border-[var(--rule)] py-12 sm:py-16">
        <RepositoryInstallPanel />
      </section>

      <section className="grid min-w-0 gap-8 py-12 sm:py-16 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 shadow-[var(--shadow-register)]">
            <div className="mb-4 flex items-center gap-3">
              <Search className="text-[var(--accent)]" size={18} />
              <div>
                <h2 className="text-lg font-bold tracking-[-0.03em] text-[var(--foreground)]">Skill index</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Search display names and descriptions.
                </p>
              </div>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]" htmlFor="skill-search">
              Search catalog
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input
                id="skill-search"
                type="text"
                placeholder="Search skills"
                className="relative h-12 w-full border border-[var(--rule)] bg-[var(--background)] pl-10 pr-3 text-sm font-medium text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 border border-[var(--rule)] font-mono text-xs">
              <div className="border-r border-[var(--rule)] p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{orderedSkills.length}</p>
                <p className="mt-1 text-[var(--muted)]">visible</p>
              </div>
              <div className="p-3">
                <p className="text-lg font-semibold text-[var(--foreground)]">{totalSkills}</p>
                <p className="mt-1 text-[var(--muted)]">total</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 border-b border-[var(--rule)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">catalog records</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[var(--foreground)] sm:text-4xl">
                Browse the working set
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <Files size={16} />
              <span>{totalFiles} files indexed</span>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.08fr_0.92fr]">
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

          {orderedSkills.length === 0 && (
            <div className="border border-[var(--rule)] bg-[var(--surface)] px-6 py-20 shadow-[var(--shadow-register)]">
              <div className="mb-5 h-1 w-24 bg-[var(--accent)]" />
              <h3 className="text-2xl font-black tracking-[-0.04em] text-[var(--foreground)]">No matching records</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                The current search does not match any skill name or description. Clear or narrow the query to restore the catalog.
              </p>
            </div>
          )}
        </div>
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
