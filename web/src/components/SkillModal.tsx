'use client';

import { Skill } from '@/lib/skills';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Terminal, Copy, Check, ExternalLink, CalendarDays, Files } from 'lucide-react';
import { formatSkillPublishedAt } from '@/lib/utils';
import { trackEvent } from '@/lib/gtag';

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
  const trackedViewSlug = useRef<string | null>(null);
  const displayName = skill?.metadata?.name ?? skill?.name ?? 'Loading skill';
  const publishedAt = formatSkillPublishedAt(skill?.metadata?.created);
  const fileCountLabel = skill ? `${skill.fileCount} ${skill.fileCount === 1 ? 'file' : 'files'}` : null;

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  useEffect(() => {
    if (!isOpen) {
      trackedViewSlug.current = null;
      return;
    }

    if (!skill || trackedViewSlug.current === skill.slug) {
      return;
    }

    trackEvent('skill_detail_view', {
      skill_slug: skill.slug,
      skill_name: displayName,
      install_name: skill.installName,
    });
    trackedViewSlug.current = skill.slug;
  }, [displayName, isOpen, skill]);

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
    if (skill) {
      trackEvent('skill_install_copy', {
        skill_slug: skill.slug,
        skill_name: displayName,
        install_name: skill.installName,
      });
    }
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
          <div className="fixed inset-0 bg-[#101114]/35 backdrop-blur-md" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] border border-black/10 bg-[#fbfcfd] p-0 shadow-[0_42px_120px_-52px_rgba(15,23,42,0.75)] transition-all dark:border-white/10 dark:bg-[#151821]">
                <div className="h-2 bg-[linear-gradient(90deg,#8ddfc9,#d7f6a7,#c6d8ff,#d8ccff)]" />
                <div className="flex items-start justify-between gap-3 border-b border-black/5 bg-white/70 px-5 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:items-center sm:gap-5 sm:px-7">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e7fbf4] text-[#178a70] dark:bg-emerald-300/10 dark:text-[#8ddfc9]">
                        <Terminal size={20} />
                      </div>
                      <Dialog.Title as="h3" className="min-w-0 text-xl font-black leading-tight text-[#111318] dark:text-white">
                        {displayName}
                      </Dialog.Title>
                    </div>
                    <div className="min-w-0 pl-14">
                      {skill ? (
                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-[12px] font-semibold text-[#7a8493] dark:text-[#aeb7c6]">
                          <span className="inline-flex items-center rounded-full bg-[#edf7f4] px-2.5 py-1 text-[10px] lowercase text-[#2d8c75] dark:bg-emerald-300/10 dark:text-[#8ddfc9]">
                            {skill.name}
                          </span>
                          {publishedAt ? (
                            <div className="flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-2.5 py-1 text-[#5867c8] dark:bg-indigo-300/10 dark:text-[#b7c4ff]">
                              <CalendarDays size={12} className="flex-shrink-0" />
                              <span>{publishedAt}</span>
                            </div>
                          ) : null}
                          {fileCountLabel ? (
                            <div className="flex items-center gap-1.5 rounded-full bg-[#f2f8fb] px-2.5 py-1 text-[#536274] dark:bg-white/[0.08] dark:text-[#aeb7c6]">
                              <Files size={12} className="flex-shrink-0" />
                              <span>{fileCountLabel}</span>
                            </div>
                          ) : null}
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              trackEvent('skill_source_click', {
                                skill_slug: skill.slug,
                                skill_name: displayName,
                                target: 'github_skill_source',
                              });
                            }}
                            className="inline-flex shrink-0 basis-full items-center justify-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-white transition-colors hover:bg-[#27302d] dark:bg-white dark:text-black dark:hover:bg-[#dbe5e1] sm:basis-auto"
                            title="View source file on GitHub"
                          >
                            <ExternalLink size={12} className="flex-shrink-0" />
                            <span>View on GitHub</span>
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={onClose}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#687586] shadow-sm ring-1 ring-black/5 transition hover:bg-[#eef8f5] hover:text-black focus:outline-none focus:ring-2 focus:ring-[#8ddfc9]/60 dark:bg-white/[0.08] dark:text-[#aeb7c6] dark:ring-white/10 dark:hover:bg-white/[0.14] dark:hover:text-white"
                      aria-label="Close skill details"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[62vh] overflow-y-auto px-5 py-6 custom-scrollbar sm:px-7">
                  {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 rounded-full bg-[#edf7f4] dark:bg-white/10" />
                      <div className="h-4 rounded-full bg-[#eef2ff] dark:bg-white/10" />
                      <div className="h-4 w-5/6 rounded-full bg-[#f2f8fb] dark:bg-white/10" />
                      <div className="h-24 rounded-3xl bg-white dark:bg-white/10" />
                    </div>
                  ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                      {error}
                    </div>
                  ) : skill ? (
                    <div className="prose max-w-none text-[#374151] dark:prose-invert dark:text-[#cdd5df]
                      prose-headings:font-black prose-headings:text-[#111318] dark:prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl
                      prose-p:text-sm prose-p:leading-7 prose-li:text-sm prose-li:leading-7 prose-a:font-semibold prose-a:text-[#178a70]">
                      <ReactMarkdown
                        components={{
                          pre({ children }) {
                            return (
                              <pre className="my-4 overflow-x-auto rounded-2xl border border-black/5 bg-[#111318] p-4 text-xs shadow-[0_20px_60px_-44px_rgba(15,23,42,0.8)] dark:border-white/10 dark:bg-black">
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
                              <code className="mx-0.5 rounded-md bg-[#eef8f5] px-2 py-0.5 font-semibold text-[#146f5d] before:content-none after:content-none dark:bg-emerald-300/10 dark:text-[#8ddfc9]" {...rest}>
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
                  <div className="border-t border-black/5 bg-[linear-gradient(90deg,#f4fbf8,#f8f9ff)] px-5 py-5 dark:border-white/10 dark:bg-[linear-gradient(90deg,rgba(141,223,201,0.08),rgba(198,216,255,0.08))] sm:px-7">
                  <p className="text-[10px] font-bold text-[#7a8493] uppercase tracking-widest mb-2.5 ml-1 dark:text-[#aeb7c6]">
                    Install this Skill
                  </p>
                  <div className="group">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm transition-all group-hover:border-[#8ddfc9] dark:border-white/10 dark:bg-black/20">
                      <Terminal size={16} className="text-[#178a70] flex-shrink-0" />
                      <code className="min-w-0 flex-1 select-all truncate text-xs font-mono text-[#3f4754] dark:text-[#d9e1ea]">
                        {command}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        type="button"
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-bold text-xs leading-none transition-all ${
                          copied 
                            ? 'bg-[#178a70] text-white scale-95' 
                            : 'bg-black dark:bg-white text-white dark:text-black hover:bg-[#27302d] dark:hover:bg-[#dbe5e1] active:scale-95'
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
