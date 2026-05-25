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

  const featuredSkills = orderedSkills.slice(0, 3);

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

        <div className="relative mx-auto mt-12 max-w-5xl rounded-[1.75rem] border border-black/10 bg-[#f7f9fb] p-3 shadow-[0_28px_90px_-54px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-[#151821]">
          <div className="grid min-h-[21rem] gap-3 rounded-[1.35rem] bg-[linear-gradient(135deg,#f9fbff_0%,#eefcf7_48%,#f4f1ff_100%)] p-3 dark:bg-[linear-gradient(135deg,#191d27_0%,#10241f_48%,#1c182b_100%)] lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="rounded-[1.1rem] border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/20">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
                  <Terminal size={15} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#15171c] dark:text-white">Skills Library</p>
                  <p className="text-xs text-[#7a8493] dark:text-[#9fa8b8]">{orderedSkills.length} shown</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-2xl bg-[#e7fbf4] p-3 dark:bg-emerald-400/10">
                  <Layers3 className="mb-7 text-[#209a7a]" size={18} />
                  <span className="block text-3xl font-black text-[#111318] dark:text-white">{totalSkills}</span>
                  <span className="text-xs font-semibold text-[#687586] dark:text-[#b8c0cc]">published skills</span>
                </div>
                <div className="rounded-2xl bg-[#eef2ff] p-3 dark:bg-indigo-400/10">
                  <Files className="mb-7 text-[#6473d8]" size={18} />
                  <span className="block text-3xl font-black text-[#111318] dark:text-white">{totalFiles}</span>
                  <span className="text-xs font-semibold text-[#687586] dark:text-[#b8c0cc]">source files</span>
                </div>
              </div>
            </aside>

            <div className="rounded-[1.1rem] border border-white/70 bg-white/72 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/20">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f8a9a]" size={18} />
                <input
                  type="text"
                  placeholder="Search skills..."
                  className="h-12 w-full rounded-2xl border border-black/5 bg-white pl-11 pr-4 text-sm font-medium text-[#15171c] outline-none transition focus:border-[#8ddfc9] focus:ring-4 focus:ring-[#8ddfc9]/25 dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {featuredSkills.map((skill) => (
                  <div
                    key={skill.slug}
                    className="min-h-40 rounded-[1.15rem] border border-black/5 bg-white/80 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-white/[0.08]"
                  >
                    <span className="mb-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#dff8f1] text-[#178a70] dark:bg-emerald-300/15">
                      <Terminal size={13} />
                    </span>
                    <h2 className="line-clamp-2 text-sm font-bold leading-5 text-[#16181d] dark:text-white">
                      {skill.metadata?.name ?? skill.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6f7887] dark:text-[#aeb7c6]">
                      {skill.metadata?.description ?? skill.description}
                    </p>
                  </div>
                ))}
              </div>
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
