'use client';

import { SkillMetadata } from '@/lib/skills';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface SkillCardProps {
  skill: SkillMetadata;
  onClick: (skill: SkillMetadata) => void;
}

export function SkillCard({ skill, onClick }: SkillCardProps) {
  const IconComponent = (Icons[skill.icon as keyof typeof Icons] || Icons.Code) as any;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(skill)}
      className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
          <IconComponent size={24} />
        </div>
        <div className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500 rounded-full">
          {skill.category}
        </div>
      </div>
      
      <h3 className="text-lg font-bold mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
        {skill.name}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
        {skill.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
        <div className="flex flex-wrap gap-1.5">
          {skill.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-2 py-0.5 rounded-md text-gray-500 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
