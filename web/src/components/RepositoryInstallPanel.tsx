'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, SquareTerminal } from 'lucide-react';
import { visibleRepositoryInstallMethods } from '@/lib/install-methods';
import { trackEvent } from '@/lib/gtag';

const copiedResetDelay = 2000;

export function RepositoryInstallPanel() {
  const methods = visibleRepositoryInstallMethods;
  const [activeMethodId, setActiveMethodId] = useState(methods[0]?.id ?? '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const activeMethod = useMemo(
    () => methods.find((method) => method.id === activeMethodId) ?? methods[0],
    [activeMethodId, methods]
  );

  useEffect(() => {
    if (!copiedKey) {
      return;
    }

    const timeout = window.setTimeout(() => setCopiedKey(null), copiedResetDelay);
    return () => window.clearTimeout(timeout);
  }, [copiedKey]);

  if (!activeMethod) {
    return null;
  }

  const copyCommands = (copyKey: string, command: string, commandLabel: string) => {
    navigator.clipboard.writeText(command);
    trackEvent('repository_install_copy', {
      provider: activeMethod.id,
      provider_label: activeMethod.label,
      command_label: commandLabel,
    });
    setCopiedKey(copyKey);
  };

  return (
    <aside className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display flex items-center gap-2 text-base font-bold tracking-tight text-[var(--foreground)]">
          <SquareTerminal size={18} strokeWidth={1.8} className="text-[var(--accent)]" />
          Quick install
        </h2>
        <div className="flex rounded-full bg-[var(--surface-muted)] p-1" aria-label="Install provider">
          {methods.map((method) => {
            const isActive = method.id === activeMethod.id;

            return (
              <motion.button
                key={method.id}
                type="button"
                onClick={() => setActiveMethodId(method.id)}
                aria-pressed={isActive}
                whileTap={{ scale: 0.94 }}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="install-provider-indicator"
                    className="absolute inset-0 rounded-full bg-[var(--surface)] shadow-[var(--shadow-card)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                ) : null}
                <span className="relative">{method.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeMethod.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
      {activeMethod.status === 'planned' ? (
        <div className="mt-5 rounded-xl bg-[var(--accent-soft)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--accent)]">Coming soon</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {activeMethod.description}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {activeMethod.commands.map((entry, index) => {
            const copyKey = `${activeMethod.id}-${index}`;
            const isCopied = copiedKey === copyKey;

            return (
              <div
                key={entry.command}
                className="flex min-w-0 items-center gap-3 rounded-xl bg-[var(--surface-muted)] py-3 pl-4 pr-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-[var(--muted)]">
                    {index + 1}. {entry.label}
                  </p>
                  <code className="block min-w-0 select-all truncate font-mono text-xs text-[var(--foreground)]" title={entry.command}>
                    {entry.command}
                  </code>
                </div>
                <motion.button
                  type="button"
                  onClick={() => copyCommands(copyKey, entry.command, entry.label)}
                  whileTap={{ scale: 0.85 }}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
                    isCopied
                      ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                      : 'bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-card)] hover:text-[var(--accent)]'
                  }`}
                  aria-label={`Copy ${entry.label} command`}
                >
                  <span className="grid">
                    <Check
                      size={14}
                      className={`col-start-1 row-start-1 place-self-center transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        isCopied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                      }`}
                    />
                    <Copy
                      size={14}
                      strokeWidth={1.5}
                      className={`col-start-1 row-start-1 place-self-center transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        isCopied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
                      }`}
                    />
                  </span>
                </motion.button>
              </div>
            );
          })}
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
