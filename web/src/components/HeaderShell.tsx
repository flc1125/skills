'use client';

import { useEffect, useState } from 'react';

interface HeaderShellProps {
  children: React.ReactNode;
}

export function HeaderShell({ children }: HeaderShellProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b bg-[var(--header)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-[var(--border)] shadow-[var(--shadow-header)]'
          : 'border-transparent shadow-none'
      }`}
    >
      {children}
    </header>
  );
}
