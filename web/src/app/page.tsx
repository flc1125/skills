import { getSkills } from '@/lib/skills';
import { Marketplace } from '@/components/Marketplace';
import { Suspense } from 'react';

export default async function Home() {
  const skills = await getSkills();

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="mb-4 h-12 w-12 bg-[var(--surface-muted)]"></div>
            <div className="mb-2 h-4 w-48 bg-[var(--surface-muted)]"></div>
            <div className="h-4 w-32 bg-[var(--surface-muted)]"></div>
          </div>
        </div>
      }>
        <Marketplace initialSkills={skills} />
      </Suspense>
    </div>
  );
}
