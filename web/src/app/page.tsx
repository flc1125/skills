import { getSkills } from '@/lib/skills';
import { Marketplace } from '@/components/Marketplace';
import { Suspense } from 'react';

export default async function Home() {
  const skills = await getSkills();

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="mx-auto max-w-[1360px] px-5 py-24 sm:px-8 lg:px-10">
          <div className="animate-pulse border-y border-[var(--rule)] py-16">
            <div className="mb-5 h-3 w-28 bg-[var(--surface-muted)]"></div>
            <div className="mb-3 h-12 w-3/5 bg-[var(--surface-muted)]"></div>
            <div className="h-12 w-2/5 bg-[var(--surface-muted)]"></div>
          </div>
        </div>
      }>
        <Marketplace initialSkills={skills} />
      </Suspense>
    </div>
  );
}
