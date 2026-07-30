'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, TerminalSquare } from 'lucide-react';
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
          <TerminalSquare size={18} strokeWidth={1.8} className="text-[var(--accent)]" />
          Quick install
        </h2>
        <div className="flex rounded-full bg-[var(--surface-muted)] p-1" aria-label="Install provider">
          {methods.map((method) => {
            const isActive = method.id === activeMethod.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setActiveMethodId(method.id)}
                aria-pressed={isActive}
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
              </button>
            );
          })}
        </div>
      </div>

      {activeMethod.status === 'planned' ? (
        <div className="mt-5 rounded-xl bg-[var(--accent-soft)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--accent)]">Coming soon</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Claude plugin support is planned but not available yet. Use the Codex channel for the current install path.
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
                  <code className="block min-w-0 overflow-x-auto whitespace-nowrap pb-1 font-mono text-xs text-[var(--foreground)] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-strong)] [&::-webkit-scrollbar-track]:bg-transparent">
                    {entry.command}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => copyCommands(copyKey, entry.command, entry.label)}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all ${
                    isCopied
                      ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                      : 'bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-card)] hover:text-[var(--accent)]'
                  }`}
                  aria-label={`Copy ${entry.label} command`}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} strokeWidth={1.5} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
