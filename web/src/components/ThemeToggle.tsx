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
      <Menu.Button className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-[#5f6673] transition-colors hover:bg-[#eef8f5] hover:text-black dark:text-[#c6ccd8] dark:hover:bg-white/10 dark:hover:text-white">
        <ActiveIcon size={15} />
        <span className="hidden sm:inline">{activeOption.label}</span>
        <ChevronDown size={14} className="text-[#9aa4b2]" />
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
        <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right rounded-2xl border border-black/5 bg-white/95 p-1.5 shadow-[0_20px_70px_-48px_rgba(15,23,42,0.8)] backdrop-blur-md focus:outline-none dark:border-white/10 dark:bg-[#151821]/95">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === theme;

            return (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleThemeChange(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#eef8f5] text-black dark:bg-white/10 dark:text-white'
                        : 'text-[#5f6673] dark:text-[#c6ccd8]'
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
