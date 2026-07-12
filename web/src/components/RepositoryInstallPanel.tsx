'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
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
    <aside className="relative ml-auto w-full max-w-[31rem] border-t border-[color-mix(in_srgb,var(--accent)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[var(--shadow-station)]">
      <span className="absolute -top-1 left-0 h-2 w-2 bg-[var(--accent)] shadow-[0_0_18px_color-mix(in_srgb,var(--accent)_75%,transparent)]" aria-hidden="true" />

      <div className="flex min-h-16 flex-col gap-4 border-b border-[var(--rule)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-extrabold tracking-[-0.02em] text-[var(--foreground)]">Install full collection</h2>
        <div className="flex items-center gap-1" aria-label="Install provider">
          {methods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setActiveMethodId(method.id)}
              className={`min-h-9 border px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                method.id === activeMethod.id
                  ? 'border-[color-mix(in_srgb,var(--signal)_55%,transparent)] text-[var(--signal)]'
                  : 'border-transparent text-[var(--muted)] hover:border-[var(--rule)] hover:text-[var(--foreground)]'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {activeMethod.status === 'planned' ? (
        <div className="px-5 py-8">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Signal pending</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Claude plugin support is planned but not available yet. Use the Codex channel for the current install path.
          </p>
        </div>
      ) : (
        <div>
          {activeMethod.commands.map((entry, index) => {
            const copyKey = `${activeMethod.id}-${index}`;
            const isCopied = copiedKey === copyKey;

            return (
              <div key={entry.command} className="relative border-b border-[var(--rule)] px-5 py-5 last:border-b-0 sm:pr-16">
                <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {String(index + 1).padStart(2, '0')} · {entry.label}
                </p>
                <code className="block min-w-0 break-all pr-12 text-[11px] leading-5 text-[var(--foreground)] sm:overflow-x-auto sm:whitespace-nowrap sm:pr-0 sm:text-xs sm:leading-6">
                  {entry.command}
                </code>
                <button
                  type="button"
                  onClick={() => copyCommands(copyKey, entry.command, entry.label)}
                  className={`absolute bottom-4 right-4 grid h-11 w-11 place-items-center border transition-colors ${
                    isCopied
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]'
                      : 'border-[var(--rule-strong)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                  aria-label={`Copy ${entry.label} command`}
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} strokeWidth={1.5} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
