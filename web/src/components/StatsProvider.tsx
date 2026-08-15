'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { SkillStats, SkillStatsSnapshot } from '@/lib/skill-stats';

interface StatsContextValue {
  snapshot: SkillStatsSnapshot;
  patchSkillStats: (slug: string, stats: SkillStats) => void;
}

const StatsContext = createContext<StatsContextValue | null>(null);

export function StatsProvider({
  initial,
  children,
}: {
  initial: SkillStatsSnapshot;
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = useState(initial);

  const patchSkillStats = useCallback((slug: string, stats: SkillStats) => {
    setSnapshot((current) => ({
      enabled: true,
      skills: { ...current.skills, [slug]: stats },
    }));
  }, []);

  return (
    <StatsContext.Provider value={{ snapshot, patchSkillStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats(): StatsContextValue {
  const context = useContext(StatsContext);

  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }

  return context;
}
