'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { X, ArrowUp } from 'lucide-react';
import type { Skill } from '@/lib/skills';
import { SkillMarkdown } from './SkillMarkdown';
import { SkillMetaPills } from './SkillMetaPills';
import { SkillInstallAction } from './SkillInstallAction';
import { SkillSourceLink } from './SkillSourceLink';

interface SkillModalProps {
  skill: Skill;
}

export function SkillModal({ skill }: SkillModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const didClose = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const displayName = skill.metadata?.name ?? skill.name;
  const sourceUrl = `https://github.com/flc1125/skills/blob/main/skills/${skill.path}`;

  const handleClose = () => {
    didClose.current = true;
    setOpen(false);
  };

  const scrollContentToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    contentRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence
        onExitComplete={() => {
          if (didClose.current) {
            router.back();
          }
        }}
      >
        {open && (
          <Dialog open={open} onClose={handleClose} className="relative z-50">
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
                  <Dialog.Panel className="flex max-h-[calc(100vh-2rem)] max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)]">
                    <div className="shrink-0 px-6 pt-6 sm:px-8 sm:pt-7">
                      <div className="flex items-start justify-between gap-4">
                        <Dialog.Title as="h3" className="min-w-0 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                          {displayName}
                        </Dialog.Title>
                        <div className="flex shrink-0 items-center gap-2">
                          <SkillSourceLink url={sourceUrl} slug={skill.slug} name={displayName} />
                          <button
                            onClick={handleClose}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                            aria-label="Close skill details"
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </div>
                      <SkillMetaPills skill={skill} />
                    </div>

                    <div className="relative flex min-h-0 flex-1 flex-col">
                      <div
                        ref={contentRef}
                        onScroll={(event) => setShowBackToTop(event.currentTarget.scrollTop > 240)}
                        className="mt-5 min-h-0 flex-1 overflow-y-auto px-6 pb-2 custom-scrollbar sm:max-h-[58dvh] sm:px-8"
                      >
                        <SkillMarkdown skill={skill} />
                      </div>

                      <AnimatePresence>
                        {showBackToTop && (
                          <motion.button
                            key="back-to-top"
                            type="button"
                            initial={{ opacity: 0, scale: 0.6, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.6, y: 8 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                            onClick={scrollContentToTop}
                            className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] shadow-[var(--shadow-card-hover)]"
                            aria-label="Back to top"
                          >
                            <ArrowUp size={16} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="shrink-0 px-6 pb-6 pt-4 sm:px-8 sm:pb-7">
                      <SkillInstallAction skill={skill} />
                    </div>
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
