'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, PackagePlus, Terminal } from 'lucide-react';
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
    <div>
      <div className="border border-[var(--rule)] bg-[var(--surface)] shadow-[var(--shadow-register)]">
        <div className="grid gap-0 lg:grid-cols-[0.76fr_1.24fr]">
          <div className="border-b border-[var(--rule)] bg-[var(--surface-muted)] px-5 py-6 sm:px-6 lg:border-b-0 lg:border-r">
            <div className="mb-5 flex h-12 w-12 items-center justify-center bg-[var(--foreground)] text-[var(--background)]">
              <PackagePlus size={21} />
            </div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              install ledger
            </p>
            <h2 className="mt-3 max-w-sm text-3xl font-black leading-[1] tracking-[-0.055em] text-[var(--foreground)]">
              Add the full skill collection.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Install the repository as a plugin, or open a record below to copy one individual skill command.
            </p>
          </div>

          <div className="px-5 py-7 sm:px-6 sm:py-8">
            <div className="mb-4">
              <div>
                {methods.length > 1 ? (
                  <div className="inline-flex flex-wrap border border-[var(--rule)] bg-[var(--background)] p-1" aria-label="Install provider">
                    {methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setActiveMethodId(method.id)}
                        className={`inline-flex min-h-10 items-center gap-1.5 px-3 text-xs font-semibold transition ${
                          method.id === activeMethod.id
                            ? 'bg-[var(--foreground)] text-[var(--background)]'
                            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        {method.id === activeMethod.id ? <Terminal size={14} /> : null}
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="inline-flex min-h-10 items-center gap-2 border border-[var(--rule)] bg-[var(--background)] px-3 font-mono text-xs font-semibold text-[var(--accent)]">
                    <Terminal size={14} />
                    <span>{activeMethod.label}</span>
                  </div>
                )}
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {activeMethod.description}
                </p>
              </div>
            </div>

            {activeMethod.status === 'planned' ? (
              <div className="border border-[var(--rule)] bg-[var(--background)] px-4 py-5 text-sm leading-6 text-[var(--muted)]">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Coming soon
                </p>
                <p className="mt-2">
                  Claude support is not available yet. Please use Codex for now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeMethod.commands.map((entry, index) => {
                  const copyKey = `${activeMethod.id}-${index}`;
                  const isCopied = copiedKey === copyKey;

                  return (
                    <div
                      key={entry.command}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-[var(--rule)] bg-[var(--background)] px-4 py-3"
                    >
                      <span className="flex h-8 w-8 items-center justify-center bg-[var(--surface)] font-mono text-xs font-semibold text-[var(--accent)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          {entry.label}
                        </p>
                        <code className="block min-w-0 select-all truncate font-mono text-xs text-[var(--foreground)]">
                          {entry.command}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCommands(copyKey, entry.command, entry.label)}
                        className={`flex h-10 w-10 items-center justify-center transition ${
                          isCopied
                            ? 'bg-[var(--accent)] text-[var(--surface)]'
                            : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-85'
                        }`}
                        aria-label={`Copy ${entry.label} command`}
                      >
                        {isCopied ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
