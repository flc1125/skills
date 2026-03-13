'use client';

import { Skill } from '@/lib/skills';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Terminal, Copy, Check } from 'lucide-react';

interface SkillModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillModal({ skill, isOpen, onClose }: SkillModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  if (!skill) return null;

  const command = `npx skills add https://github.com/flc1125/skills --skill ${skill.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
  };

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
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Terminal size={24} />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 dark:text-white">
                        {skill.name}
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="prose dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl 
                    prose-p:leading-relaxed prose-li:leading-relaxed">
                    <ReactMarkdown
                      components={{
                        pre({ children }) {
                          return (
                            <pre className="bg-gray-900 dark:bg-black p-6 rounded-xl overflow-x-auto my-6 border border-gray-800 shadow-inner">
                              {children}
                            </pre>
                          )
                        },
                        code(props) {
                          const {children, className, ...rest} = props
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          ) : (
                            <code className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-2 py-0.5 mx-0.5 rounded font-medium before:content-none after:content-none" {...rest}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {skill.content}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Install this Skill
                  </p>
                  <div className="relative group">
                    <div className="flex items-center gap-4 px-5 py-4 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl transition-all group-hover:border-gray-200 dark:group-hover:border-gray-700">
                      <Terminal size={18} className="text-gray-400 flex-shrink-0" />
                      <code className="text-sm font-mono text-gray-600 dark:text-gray-400 select-all truncate pr-32">
                        {command}
                      </code>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
                          copied 
                            ? 'bg-green-500 text-white scale-95' 
                            : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check size={16} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
