import { getSkills } from '@/lib/skills';
import { Marketplace } from '@/components/Marketplace';

export default async function Home() {
  const skills = await getSkills();

  return (
    <div className="min-h-screen">
      <Marketplace initialSkills={skills} />
    </div>
  );
}
