import { getSkillBySlug, getSkills } from '@/lib/skills';
import { getSkillStats } from '@/lib/skill-stats';
import { Marketplace } from '@/components/Marketplace';
import { Suspense } from 'react';
import type { Metadata } from 'next';

interface HomeProps {
  searchParams: Promise<{ skill?: string }>;
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { skill } = await searchParams;

  if (!skill) {
    return {};
  }

  const entry = await getSkillBySlug(skill);

  if (!entry) {
    return {};
  }

  const name = entry.metadata?.name ?? entry.name;

  return {
    title: `${name} · Flc's Skills`,
    description: entry.metadata?.description ?? entry.description,
  };
}

export default async function Home() {
  const skills = await getSkills();
  const initialStats = await getSkillStats(skills.map((skill) => skill.slug));

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="mx-auto flex max-w-3xl animate-pulse flex-col items-center">
            <div className="mb-4 h-12 w-3/5 rounded-2xl bg-[var(--surface-muted)]"></div>
            <div className="mb-10 h-12 w-2/5 rounded-2xl bg-[var(--surface-muted)]"></div>
            <div className="h-14 w-full max-w-xl rounded-full bg-[var(--surface-muted)]"></div>
          </div>
          <div className="mt-20 grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-36 rounded-2xl bg-[var(--surface-muted)]"></div>
            ))}
          </div>
        </div>
      }>
        <Marketplace initialSkills={skills} initialStats={initialStats} />
      </Suspense>
    </div>
  );
}
