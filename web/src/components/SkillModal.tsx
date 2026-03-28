'use client';

import { Skill } from '@/lib/skills';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Terminal, Copy, Check, ExternalLink, CalendarDays, Files } from 'lucide-react';
import { formatSkillPublishedAt } from '@/lib/utils';

interface SkillModalProps {
  skill: Skill | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const GITHUB_BLOB_BASE_URL = 'https://github.com/flc1125/skills/blob/main/skills';

function normalizeGithubPathParts(parts: string[]) {
  const normalized: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') {
      continue;
    }

    if (part === '..') {
      normalized.pop();
      continue;
    }

    normalized.push(part);
  }

  return normalized;
}

function resolveSkillContentLink(skill: Skill, href?: string) {
  if (!href) {
    return href;
  }

  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  ) {
    return href;
  }

  const [pathname, hash = ''] = href.split('#');
  const baseDir = skill.path.split('/').slice(0, -1);
  const targetParts = pathname.split('/');
  const resolvedPath = normalizeGithubPathParts([...baseDir, ...targetParts]).join('/');

  return `${GITHUB_BLOB_BASE_URL}/${resolvedPath}${hash ? `#${hash}` : ''}`;
}

export function SkillModal({ skill, isOpen, isLoading, error, onClose }: SkillModalProps) {
  const [copied, setCopied] = useState(false);
  const displayName = skill?.metadata?.name ?? skill?.name ?? 'Loading skill';
  const publishedAt = formatSkillPublishedAt(skill?.metadata?.created);
  const fileCountLabel = skill ? `${skill.fileCount} ${skill.fileCount === 1 ? 'file' : 'files'}` : null;

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  if (!isOpen) return null;

  const command = skill
    ? `npx skills add https://github.com/flc1125/skills --skill ${skill.installName}`
    : '';
  const sourceUrl = skill
    ? `https://github.com/flc1125/skills/blob/main/skills/${skill.path}`
    : '';

  const copyToClipboard = () => {
    if (!command) return;
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl transition-all border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Terminal size={20} />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white">
                        {displayName}
                      </Dialog.Title>
                      {skill ? (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] font-medium text-gray-400 dark:text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-gray-100/80 px-2.5 py-1 text-[10px] font-medium lowercase tracking-[0.08em] text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
                            {skill.name}
                          </span>
                          {publishedAt ? (
                            <div className="flex items-center gap-1.5">
                              <CalendarDays size={12} className="flex-shrink-0" />
                              <span>{publishedAt}</span>
                            </div>
                          ) : null}
                          {fileCountLabel ? (
                            <div className="flex items-center gap-1.5">
                              <Files size={12} className="flex-shrink-0" />
                              <span>{fileCountLabel}</span>
                            </div>
                          ) : null}
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-black dark:text-gray-500 dark:hover:text-white"
                            title="View source file on GitHub"
                          >
                            <ExternalLink size={12} className="flex-shrink-0" />
                            <span>View on GitHub</span>
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="h-4 rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="h-24 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                  ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                      {error}
                    </div>
                  ) : skill ? (
                    <div className="prose dark:prose-invert max-w-none 
                      prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl 
                      prose-p:leading-relaxed prose-li:leading-relaxed prose-p:text-sm prose-li:text-sm">
                      <ReactMarkdown
                        components={{
                          pre({ children }) {
                            return (
                              <pre className="bg-gray-900 dark:bg-black p-4 rounded-lg overflow-x-auto my-4 border border-gray-800 shadow-inner text-xs">
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
                          },
                          a({ href, children, ...props }) {
                            const resolvedHref = skill ? resolveSkillContentLink(skill, href) : href;
                            const isExternal = resolvedHref?.startsWith('http://') || resolvedHref?.startsWith('https://');

                            return (
                              <a
                                href={resolvedHref}
                                target={isExternal ? '_blank' : undefined}
                                rel={isExternal ? 'noopener noreferrer' : undefined}
                                {...props}
                              >
                                {children}
                              </a>
                            );
                          }
                        }}
                      >
                        {skill.content}
                      </ReactMarkdown>
                    </div>
                  ) : null}
                </div>

                {skill ? (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1">
                    Install this Skill
                  </p>
                  <div className="group">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-xl transition-all group-hover:border-gray-200 dark:group-hover:border-gray-700">
                      <Terminal size={16} className="text-gray-400 flex-shrink-0" />
                      <code className="min-w-0 flex-1 select-all truncate text-xs font-mono text-gray-600 dark:text-gray-400">
                        {command}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        type="button"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs leading-none transition-all shadow-sm ${
                          copied 
                            ? 'bg-green-500 text-white scale-95' 
                            : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check size={14} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  </div>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
