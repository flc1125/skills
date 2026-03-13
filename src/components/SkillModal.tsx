'use client';

import { Skill } from '@/lib/skills';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import * as Icons from 'lucide-react';

interface SkillModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillModal({ skill, isOpen, onClose }: SkillModalProps) {
  if (!skill) return null;

  const IconComponent = (Icons[skill.icon as keyof typeof Icons] || Icons.Code) as any;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-2xl transition-all border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      <IconComponent size={32} />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                        {skill.name}
                      </Dialog.Title>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-medium text-gray-400">{skill.category}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <Icons.X size={24} />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:rounded-xl">
                    <ReactMarkdown>{skill.content}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    {skill.tags?.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-xs font-medium rounded-full text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                        // TODO: Implement "Use this skill" action if needed
                        alert('Skill added to workspace (simulation)');
                    }}
                    className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:opacity-90 transition-opacity"
                  >
                    Use this Skill
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
