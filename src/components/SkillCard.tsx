'use client';

import { SkillMetadata } from '@/lib/skills';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface SkillCardProps {
  skill: SkillMetadata;
  onClick: (skill: SkillMetadata) => void;
}

export function SkillCard({ skill, onClick }: SkillCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(skill)}
      className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
          <Terminal size={24} />
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 group-hover:text-black dark:group-hover:text-white transition-colors">
        {skill.name}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 flex-grow leading-relaxed">
        {skill.description}
      </p>
    </motion.div>
  );
}
