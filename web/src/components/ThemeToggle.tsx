'use client';

import { Fragment, useEffect, useSyncExternalStore } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MotionConfig, motion } from 'motion/react';
import { Check, Laptop, Moon, Sun } from 'lucide-react';

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

// The snapshot must change whenever the *resolved* appearance can change,
// otherwise React bails out of re-rendering and the effect applying the theme
// never re-runs. In non-system modes the system theme is irrelevant, so the
// resolved part stays empty and system changes leave the snapshot untouched.
function getThemeSnapshot(): string {
  const mode = getStoredTheme();
  return mode === 'system' ? `${mode}:${getSystemTheme()}` : mode;
}

function getServerThemeSnapshot(): string {
  return 'system:light';
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
  mediaQuery.addEventListener('change', emitThemeChange);
}

function subscribe(callback: () => void) {
  ensureMediaQuerySubscription();
  subscribers.add(callback);

  return () => {
    subscribers.delete(callback);
  };
}

export function ThemeToggle() {
  const themeSnapshot = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);
  const theme = themeSnapshot.split(':')[0] as ThemeMode;
  const activeOption = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    applyTheme(theme);
    // themeSnapshot is the real dependency: in system mode it changes when the
    // OS theme flips even though `theme` stays 'system', and the effect must
    // re-run to re-apply the resolved appearance.
  }, [theme, themeSnapshot]);

  const handleThemeChange = (mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
    emitThemeChange();
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        aria-label={`Theme selector, current theme: ${activeOption.label}`}
        title={`Theme: ${activeOption.label}`}
        className="grid h-9 w-9 place-items-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
      >
        <MotionConfig reducedMotion="user">
          <motion.span
            key={activeOption.value}
            initial={{ rotate: -120, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="grid place-items-center"
          >
            <ActiveIcon size={16} />
          </motion.span>
        </MotionConfig>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 -translate-y-1 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 -translate-y-1 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-card-hover)] focus:outline-none">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === theme;

            return (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleThemeChange(option.value)}
                    className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                      active
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={15} />
                      <span>{option.label}</span>
                    </span>
                    <span className="w-4">
                      {isActive ? <Check size={13} /> : null}
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
