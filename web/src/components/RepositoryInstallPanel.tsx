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
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-[1.5rem] border border-black/5 bg-white/78 shadow-[0_28px_86px_-60px_rgba(15,23,42,0.65)] backdrop-blur dark:border-white/10 dark:bg-white/[0.055]">
        <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="border-b border-black/5 bg-[#f8fcfa] px-5 py-6 dark:border-white/10 dark:bg-white/[0.035] sm:px-6 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7fbf4] text-[#178a70] dark:bg-emerald-300/10 dark:text-[#8ddfc9]">
              <PackagePlus size={21} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7a8493] dark:text-[#aeb7c6]">
              Plugin install
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-[#111318] dark:text-white">
              Add Flc's Skills to your assistant
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#687586] dark:text-[#aeb7c6]">
              Install the repository as a plugin so your assistant can load the full skill set. Prefer a single skill instead? Open any card and copy its individual install command.
            </p>
          </div>

          <div className="px-5 py-7 sm:px-6 sm:py-8">
            <div className="mb-4">
              <div>
                {methods.length > 1 ? (
                  <div className="inline-flex flex-wrap rounded-full bg-black/5 p-1 dark:bg-white/10" aria-label="Install provider">
                    {methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setActiveMethodId(method.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                          method.id === activeMethod.id
                            ? 'bg-[#edf7f4] text-[#2d8c75] shadow-sm dark:bg-emerald-300/10 dark:text-[#8ddfc9]'
                            : 'text-[#687586] hover:text-[#111318] dark:text-[#aeb7c6] dark:hover:text-white'
                        }`}
                      >
                        {method.id === activeMethod.id ? <Terminal size={14} /> : null}
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#edf7f4] px-3 py-1.5 text-xs font-bold text-[#2d8c75] dark:bg-emerald-300/10 dark:text-[#8ddfc9]">
                    <Terminal size={14} />
                    <span>{activeMethod.label}</span>
                  </div>
                )}
                <p className="mt-3 text-sm leading-6 text-[#687586] dark:text-[#aeb7c6]">
                  {activeMethod.description}
                </p>
              </div>
            </div>

            {activeMethod.status === 'planned' ? (
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-5 text-sm leading-6 text-[#687586] shadow-sm dark:border-white/10 dark:bg-black/20 dark:text-[#aeb7c6]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a8493] dark:text-[#aeb7c6]">
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
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-black/20"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-black text-[#5867c8] dark:bg-indigo-300/10 dark:text-[#b7c4ff]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#7a8493] dark:text-[#aeb7c6]">
                          {entry.label}
                        </p>
                        <code className="block min-w-0 select-all truncate font-mono text-xs text-[#3f4754] dark:text-[#d9e1ea]">
                          {entry.command}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCommands(copyKey, entry.command, entry.label)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                          isCopied
                            ? 'bg-[#178a70] text-white'
                            : 'bg-black text-white hover:bg-[#27302d] dark:bg-white dark:text-black dark:hover:bg-[#dbe5e1]'
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
