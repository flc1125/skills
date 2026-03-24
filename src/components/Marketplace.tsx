'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { SkillMetadata, Skill } from '@/lib/skills';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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
      const matchesSearch = 
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });
  }, [initialSkills, search]);

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
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero Section */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Supercharge your <span className="text-gray-400">Agents.</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          A curated collection of specialized skills to extend the capabilities of your AI workforce.
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search skills..."
            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-md text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} onClick={handleCardClick} />
          ))}
        </AnimatePresence>
      </div>

      {filteredSkills.length === 0 && (
        <div className="py-24 text-center">
          <div className="inline-flex p-8 bg-gray-50 dark:bg-gray-900 rounded-full mb-6">
            <Search size={48} className="text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No results found</h3>
          <p className="text-gray-500 text-lg">Try adjusting your search terms.</p>
        </div>
      )}

      {/* Modal */}
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
