'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SkillMetadata, Skill } from '@/lib/skills';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface MarketplaceProps {
  initialSkills: SkillMetadata[];
}

export function Marketplace({ initialSkills }: MarketplaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync modal with URL on load and URL change
  useEffect(() => {
    const skillSlug = searchParams.get('skill');
    if (skillSlug) {
      const fetchSkill = async () => {
        try {
          const response = await fetch(`/api/skills/${skillSlug}`);
          if (response.ok) {
            const data = await response.json();
            setSelectedSkill(data);
            setIsModalOpen(true);
          } else {
            // If skill not found, clear URL
            router.replace(pathname);
          }
        } catch (error) {
          console.error('Failed to fetch skill details:', error);
        }
      };
      fetchSkill();
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams, pathname, router]);

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
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-20 text-center max-w-3xl mx-auto">
        <h1 className="text-6xl font-black mb-6 tracking-tight">
          Supercharge your <span className="text-gray-400">Agents.</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed">
          A curated collection of specialized skills to extend the capabilities of your AI workforce.
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search skills by name or description..."
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-lg text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
