'use client';

import { useState, useMemo } from 'react';
import { SkillMetadata, Skill } from '@/lib/skills';
import { SkillCard } from './SkillCard';
import { SkillModal } from './SkillModal';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface MarketplaceProps {
  initialSkills: SkillMetadata[];
}

export function Marketplace({ initialSkills }: MarketplaceProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(initialSkills.map((s) => s.category)));
    return cats.sort();
  }, [initialSkills]);

  const filteredSkills = useMemo(() => {
    return initialSkills.filter((skill) => {
      const matchesSearch = 
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase()) ||
        skill.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = !selectedCategory || skill.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [initialSkills, search, selectedCategory]);

  const handleCardClick = async (skillMeta: SkillMetadata) => {
    // Fetch full skill content
    try {
      const response = await fetch(`/api/skills/${skillMeta.slug}`);
      const data = await response.json();
      setSelectedSkill(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch skill details:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-black mb-6 tracking-tight">
          Supercharge your <span className="text-gray-400">Agents.</span>
        </h1>
        <p className="text-lg text-gray-500">
          Discover, install, and share specialized skills to extend the capabilities of your AI workforce.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search skills, tags, or authors..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              !selectedCategory 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All Skills
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
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
        <div className="py-20 text-center">
          <div className="inline-flex p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl mb-4">
            <Search size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold mb-2">No skills found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Modal */}
      <SkillModal
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
