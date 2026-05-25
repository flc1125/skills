'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { SkillMetadata, Skill } from '@/lib/skills';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { Files, Layers3, Search, Terminal } from 'lucide-react';
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
    <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/70 px-5 py-12 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_50%_0%,rgba(153,246,228,0.42),transparent_58%),radial-gradient(circle_at_72%_18%,rgba(196,181,253,0.32),transparent_42%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-[clamp(2.5rem,7vw,6.5rem)] font-black leading-[0.95] text-[#101114] dark:text-white">
            AI agent skills, composed into a calm workspace.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#5f6673] dark:text-[#c6ccd8] sm:text-lg">
            Browse reusable workflows through a light, product-like interface built for quick discovery and precise installation.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl rounded-[1.75rem] bg-[#f7f9fb]/74 p-3 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.46)] backdrop-blur dark:bg-[#151821]/72">
          <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(249,251,255,0.84)_0%,rgba(238,252,247,0.82)_48%,rgba(244,241,255,0.84)_100%)] p-4 dark:bg-[linear-gradient(135deg,rgba(25,29,39,0.86)_0%,rgba(16,36,31,0.78)_48%,rgba(28,24,43,0.86)_100%)] sm:p-5">
            <div className="relative min-h-32 overflow-hidden rounded-[1.4rem] bg-white/42 px-5 py-5 shadow-[0_16px_52px_-44px_rgba(15,23,42,0.5)] backdrop-blur dark:bg-white/[0.045] sm:min-h-36 sm:px-7">
              <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-56 rounded-full bg-[#8ddfc9]/18 blur-2xl" />
              <div className="pointer-events-none absolute -right-8 top-0 h-32 w-56 rounded-full bg-[#c6d8ff]/28 blur-2xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-sm">
                  <div className="mb-8 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e7fbf4] text-[#209a7a] dark:bg-emerald-300/10">
                    <Layers3 size={18} />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black leading-none text-[#111318] dark:text-white">{totalSkills}</span>
                    <span className="text-sm font-semibold text-[#687586] dark:text-[#b8c0cc]">published skills</span>
                  </div>
                </div>

                <div className="self-start rounded-[1.3rem] bg-white/72 px-5 py-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.6)] backdrop-blur dark:bg-white/[0.075] sm:mr-3 sm:mt-2">
                  <Files className="mb-5 text-[#6473d8]" size={18} />
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black leading-none text-[#111318] dark:text-white">{totalFiles}</span>
                    <span className="pb-1 text-xs font-semibold text-[#687586] dark:text-[#b8c0cc]">source files</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-5">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7f8a9a]" size={19} />
              <input
                type="text"
                placeholder="Search skills..."
                className="h-14 w-full rounded-2xl bg-white/86 pl-13 pr-5 text-sm font-medium text-[#15171c] outline-none shadow-[0_14px_38px_-32px_rgba(15,23,42,0.55)] transition focus:ring-4 focus:ring-[#8ddfc9]/25 dark:bg-white/[0.08] dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#111318] dark:text-white">Explore skills</h2>
            <p className="mt-2 text-sm leading-6 text-[#687586] dark:text-[#aeb7c6]">
              Newer skill definitions appear first. Select any entry to read the full instruction file.
            </p>
          </div>
          <div className="flex rounded-full bg-black px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black">
            {orderedSkills.length} available
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="rounded-[2rem] border border-black/5 bg-white/70 py-24 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7fbf4]">
              <Search size={30} className="text-[#209a7a]" />
            </div>
            <h3 className="text-2xl font-black text-[#111318] dark:text-white">No results found</h3>
            <p className="mt-2 text-[#687586] dark:text-[#aeb7c6]">Try adjusting your search terms.</p>
          </div>
        )}
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
