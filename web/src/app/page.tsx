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
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      }>
        <Marketplace initialSkills={skills} />
      </Suspense>
    </div>
  );
}
