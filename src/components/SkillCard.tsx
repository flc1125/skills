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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(skill)}
      className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors flex-shrink-0">
          <Terminal size={16} />
        </div>
        <h3 className="text-base font-bold group-hover:text-black dark:group-hover:text-white transition-colors truncate">
          {skill.name}
        </h3>
      </div>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed flex-grow">
        {skill.description}
      </p>
    </motion.div>
  );
}
