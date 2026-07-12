'use client';

import { Fragment, useEffect, useSyncExternalStore } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Check, ChevronDown, Laptop, Moon, Sun } from 'lucide-react';

type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

const OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: typeof Laptop;
}> = [
  { value: 'system', label: 'Auto', icon: Laptop },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const storedTheme = localStorage.getItem(STORAGE_KEY);
  return isThemeMode(storedTheme) ? storedTheme : 'system';
}

function getSystemTheme() {
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
  const root = document.documentElement;

  root.dataset.theme = mode;
  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.style.colorScheme = resolvedTheme;
}

const subscribers = new Set<() => void>();
let mediaQuery: MediaQueryList | null = null;

function emitThemeChange() {
  subscribers.forEach((callback) => callback());
}

function ensureMediaQuerySubscription() {
  if (typeof window === 'undefined' || mediaQuery) {
    return;
  }

  mediaQuery = window.matchMedia(MEDIA_QUERY);
  mediaQuery.addEventListener('change', () => {
    if (getStoredTheme() === 'system') {
      emitThemeChange();
    }
  });
}

function subscribe(callback: () => void) {
  ensureMediaQuerySubscription();
  subscribers.add(callback);

  return () => {
    subscribers.delete(callback);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getStoredTheme, (): ThemeMode => 'system');
  const activeOption = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleThemeChange = (mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
    emitThemeChange();
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        aria-label={`Theme selector, current theme: ${activeOption.label}`}
        className="inline-flex h-11 min-w-11 items-center gap-2 border border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface)_66%,transparent)] px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] hover:text-[var(--foreground)]"
      >
        <ActiveIcon size={15} />
        <span className="hidden sm:inline">{activeOption.label}</span>
        <ChevronDown size={13} className="text-[var(--muted)]" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right border border-[var(--rule-strong)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-station)] backdrop-blur-md focus:outline-none">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === theme;

            return (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleThemeChange(option.value)}
                    className={`flex min-h-11 w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                      active
                        ? 'bg-[var(--surface-muted)] text-[var(--accent)]'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={15} />
                      <span>{option.label}</span>
                    </span>
                    <span className="w-4">
                      {isActive ? <Check size={14} /> : null}
                    </span>
                  </button>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
