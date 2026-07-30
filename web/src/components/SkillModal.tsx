'use client';

import { Skill } from '@/lib/skills';
import { Dialog } from '@headlessui/react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
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
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[rgba(12,14,22,0.45)] backdrop-blur-sm"
              aria-hidden="true"
            />

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 10 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  className="w-full max-w-3xl"
                >
                  <Dialog.Panel className="w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)]">
                  <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-7">
                    <div className="min-w-0">
                      <Dialog.Title as="h3" className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                        {displayName}
                      </Dialog.Title>
                      {skill ? (
                        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex h-7 max-w-full items-center rounded-full bg-[var(--surface-muted)] px-3 font-mono text-[11px] text-[var(--muted)]">
                            {skill.name}
                          </span>
                          {publishedAt ? (
                            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 text-[var(--muted)]">
                              <CalendarDays size={12} className="shrink-0" />
                              {publishedAt}
                            </span>
                          ) : null}
                          {fileCountLabel ? (
                            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 text-[var(--muted)]">
                              <Files size={12} className="shrink-0" />
                              {fileCountLabel}
                            </span>
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
                            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--on-accent)]"
                            title="View source file on GitHub"
                          >
                            <ExternalLink size={12} className="shrink-0" />
                            View on GitHub
                          </a>
                        </div>
                      ) : null}
                    </div>
                    <button
                      onClick={onClose}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                      aria-label="Close skill details"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div className="mt-5 max-h-[58vh] overflow-y-auto px-6 pb-2 custom-scrollbar sm:px-8">
                    {isLoading ? (
                      <div className="space-y-3 animate-pulse pb-4">
                        <div className="h-4 rounded-full bg-[var(--surface-muted)]" />
                        <div className="h-4 rounded-full bg-[var(--surface-muted)]" />
                        <div className="h-4 w-5/6 rounded-full bg-[var(--surface-muted)]" />
                        <div className="h-24 rounded-2xl bg-[var(--surface-muted)]" />
                      </div>
                    ) : error ? (
                      <div className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--foreground)]">
                        {error}
                      </div>
                    ) : skill ? (
                      <div className="prose max-w-none text-[var(--foreground)] dark:prose-invert
                        prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--foreground)] prose-h1:text-2xl prose-h2:text-xl
                        prose-p:max-w-[65ch] prose-p:text-sm prose-p:leading-7 prose-p:text-[var(--muted)] prose-li:text-sm prose-li:leading-7 prose-li:text-[var(--muted)] prose-a:font-semibold prose-a:text-[var(--accent)]">
                        <ReactMarkdown
                          components={{
                            pre({ children }) {
                              return (
                                <pre className="my-4 overflow-x-auto rounded-xl bg-[var(--surface-muted)] p-4 text-xs text-[var(--foreground)]">
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
                                <code className="mx-0.5 rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-semibold text-[var(--foreground)] before:content-none after:content-none" {...rest}>
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
                    <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-7">
                      <p className="mb-2 text-xs font-medium text-[var(--muted)]">
                        Install this skill
                      </p>
                      <div className="flex items-center gap-3 rounded-xl bg-[var(--surface-muted)] py-2.5 pl-4 pr-2">
                        <Terminal size={15} className="shrink-0 text-[var(--accent)]" />
                        <code className="min-w-0 flex-1 select-all truncate font-mono text-xs text-[var(--foreground)]">
                          {command}
                        </code>
                        <motion.button
                          onClick={copyToClipboard}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-colors ${
                            copied
                              ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                              : 'bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-card)] hover:text-[var(--accent)]'
                          }`}
                        >
                          <span className="grid">
                            <span
                              className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                copied ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                              }`}
                            >
                              <Check size={13} />
                              <span>Copied</span>
                            </span>
                            <span
                              className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                copied ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
                              }`}
                            >
                              <Copy size={13} />
                              <span>Copy</span>
                            </span>
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  ) : null}
                  </Dialog.Panel>
                </motion.div>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
