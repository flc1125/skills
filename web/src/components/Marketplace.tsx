'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { SkillMetadata, Skill } from '@/lib/skills';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { Files, Layers3, Search } from 'lucide-react';
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
    <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6 lg:px-8">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden px-6 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_45%_45%,rgba(141,223,201,0.32),rgba(198,216,255,0.24)_42%,rgba(199,185,255,0.16)_58%,transparent_74%)] blur-3xl dark:opacity-50" />
        <div className="pointer-events-none absolute left-[12%] top-32 h-28 w-28 rounded-full bg-[#8ddfc9]/18 blur-2xl" />
        <div className="pointer-events-none absolute right-[14%] top-44 h-32 w-32 rounded-full bg-[#c6d8ff]/22 blur-2xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-[clamp(2.75rem,6vw,5.5rem)] font-black leading-[1.02] text-[#101114] dark:text-white">
              A quieter way to discover agent skills.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#5f6673] dark:text-[#c6ccd8] sm:text-lg">
              Find reusable workflows, inspect their instructions, and copy the exact install command without leaving the workspace.
            </p>
          </div>

          <div className="mx-auto mt-11 max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:bg-white/[0.07]">
                <Layers3 size={15} className="text-[#209a7a]" />
                <span className="font-black text-[#111318] dark:text-white">{totalSkills}</span>
                <span className="font-medium text-[#687586] dark:text-[#b8c0cc]">published skills</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:bg-white/[0.07]">
                <Files size={15} className="text-[#6473d8]" />
                <span className="font-black text-[#111318] dark:text-white">{totalFiles}</span>
                <span className="font-medium text-[#687586] dark:text-[#b8c0cc]">source files</span>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-x-8 -top-5 h-16 rounded-full bg-[#8ddfc9]/20 blur-2xl dark:bg-[#8ddfc9]/12" />
              <Search className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-[#7f8a9a]" size={20} />
              <input
                type="text"
                placeholder="Search skills..."
                className="relative z-0 h-16 w-full rounded-[1.35rem] bg-white/82 pl-14 pr-5 text-base font-medium text-[#15171c] outline-none shadow-[0_30px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur transition placeholder:text-[#8a94a3] focus:ring-4 focus:ring-[#8ddfc9]/25 dark:bg-white/[0.08] dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-8 mb-12 h-16 max-w-5xl" aria-hidden="true">
        <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-[#91dcca]/50 to-transparent dark:via-white/18" />
        <div className="absolute left-1/2 top-1/2 h-12 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(141,223,201,0.26),rgba(198,216,255,0.3),rgba(199,185,255,0.22))] blur-2xl" />
      </div>

      <section className="mt-0">
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
