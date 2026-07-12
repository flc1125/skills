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
          <div className="fixed inset-0 bg-[rgba(2,7,14,0.74)] backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden border border-[var(--rule-strong)] border-t-[color-mix(in_srgb,var(--accent)_72%,transparent)] bg-[var(--surface)] p-0 shadow-[var(--shadow-station)] transition-all">
                <div className="relative h-1 bg-[var(--accent)] after:absolute after:left-0 after:top-0 after:h-2 after:w-2 after:bg-[var(--accent)] after:shadow-[0_0_18px_color-mix(in_srgb,var(--accent)_72%,transparent)]" />
                <div className="flex items-start justify-between gap-3 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface-muted)_72%,var(--surface))] px-5 py-5 sm:items-center sm:gap-5 sm:px-7">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--rule-strong)] bg-[var(--background)] text-[var(--signal)]">
                        <Terminal size={19} strokeWidth={1.5} />
                      </div>
                      <Dialog.Title as="h3" className="font-display min-w-0 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--foreground)]">
                        {displayName}
                      </Dialog.Title>
                    </div>
                    <div className="min-w-0 pl-14">
                      {skill ? (
                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 font-mono text-[10px] font-semibold text-[var(--muted)]">
                          <span className="inline-flex h-8 max-w-full items-center border border-[var(--rule)] bg-[var(--background)] px-2.5 lowercase text-[var(--signal)]">
                            {skill.name}
                          </span>
                          {publishedAt ? (
                            <div className="flex h-8 items-center gap-1.5 border border-[var(--rule)] bg-[var(--background)] px-2.5 text-[var(--muted)]">
                              <CalendarDays size={12} className="flex-shrink-0" />
                              <span>{publishedAt}</span>
                            </div>
                          ) : null}
                          {fileCountLabel ? (
                            <div className="flex h-8 items-center gap-1.5 border border-[var(--rule)] bg-[var(--background)] px-2.5 text-[var(--muted)]">
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
                            className="inline-flex h-8 shrink-0 basis-full items-center justify-center gap-1.5 border border-[var(--rule-strong)] bg-[var(--background)] px-2.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:basis-auto"
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
                      className="flex h-11 w-11 items-center justify-center border border-[var(--rule-strong)] bg-[var(--background)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      aria-label="Close skill details"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[62vh] overflow-y-auto px-5 py-6 custom-scrollbar sm:px-7">
                  {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-[var(--surface-muted)]" />
                      <div className="h-4 bg-[var(--surface-muted)]" />
                      <div className="h-4 w-5/6 bg-[var(--surface-muted)]" />
                      <div className="h-24 bg-[var(--background)]" />
                    </div>
                  ) : error ? (
                    <div className="border border-[var(--rule)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)]">
                      {error}
                    </div>
                  ) : skill ? (
                    <div className="prose max-w-none text-[var(--foreground)] dark:prose-invert
                      prose-headings:font-display prose-headings:font-extrabold prose-headings:tracking-[-0.04em] prose-headings:text-[var(--foreground)] prose-h1:text-3xl prose-h2:text-2xl
                      prose-p:max-w-[65ch] prose-p:text-sm prose-p:leading-7 prose-p:text-[var(--muted)] prose-li:text-sm prose-li:leading-7 prose-li:text-[var(--muted)] prose-a:font-semibold prose-a:text-[var(--accent)]">
                      <ReactMarkdown
                        components={{
                          pre({ children }) {
                            return (
                              <pre className="my-4 overflow-x-auto border border-[var(--rule-strong)] bg-[var(--background)] p-4 text-xs text-[var(--foreground)]">
                                {children}
                              </pre>
                            )
                          },
                          code(props) {
                            const { children, className, ...codeProps } = props;
                            const { node: _node, inline: _inline, ...rest } = codeProps as typeof codeProps & {
                              inline?: boolean;
                              node?: unknown;
                            };
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                              <code className={className} {...rest}>
                                {children}
                              </code>
                            ) : (
                              <code className="mx-0.5 bg-[var(--surface-muted)] px-2 py-0.5 font-semibold text-[var(--foreground)] before:content-none after:content-none" {...rest}>
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
                  <div className="border-t border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface-muted)_72%,var(--surface))] px-5 py-5 sm:px-7">
                  <p className="mb-2.5 ml-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Install this individual skill
                  </p>
                  <div className="group">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-[var(--rule-strong)] bg-[var(--background)] px-4 py-3 transition-colors group-hover:border-[var(--accent)]">
                      <Terminal size={16} className="flex-shrink-0 text-[var(--signal)]" />
                      <code className="min-w-0 flex-1 select-all truncate font-mono text-xs text-[var(--foreground)]">
                        {command}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        type="button"
                        className={`flex min-h-11 items-center gap-1.5 px-4 font-bold text-xs leading-none transition-all ${
                          copied 
                            ? 'bg-[var(--accent)] text-white scale-95'
                            : 'border border-[var(--rule-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95'
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
