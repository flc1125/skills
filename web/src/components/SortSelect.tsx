'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import type { SortKey, SortOption } from '@/lib/sorting';

interface SortSelectProps {
  value: SortKey;
  options: SortOption[];
  onChange: (key: SortKey) => void;
}

export function SortSelect({ value, options, onChange }: SortSelectProps) {
  const currentOption = options.find((option) => option.key === value) ?? options[0];

  if (!currentOption) {
    return null;
  }

  return (
    <div className="relative">
      <Listbox value={value} onChange={onChange}>
        <ListboxButton className="group flex h-9 items-center gap-2 rounded-full border border-transparent px-3 text-sm text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] focus:outline-none data-[focus]:ring-2 data-[focus]:ring-[var(--accent)]">
          <ArrowUpDown size={13} strokeWidth={2} className="shrink-0" aria-hidden="true" />
          <span className="sr-only">Sort skills</span>
          <span className="truncate">{currentOption.label}</span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            className="shrink-0 transition-transform duration-200 group-data-[open]:rotate-180"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-modal)] focus:outline-none">
          {options.map((option) => (
            <ListboxOption
              key={option.key}
              value={option.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] data-[focus]:bg-[var(--surface-muted)] focus:outline-none"
            >
              {({ selected }) => (
                <>
                  <span className={selected ? 'font-semibold text-[var(--foreground)]' : undefined}>
                    {option.label}
                  </span>
                  {selected ? (
                    <Check size={14} strokeWidth={2} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />
                  ) : null}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
