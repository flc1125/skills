import { StatsProvider } from '@/components/StatsProvider';
import { getSkills } from '@/lib/skills';
import { getSkillStats } from '@/lib/skill-stats';

export default async function SiteLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const skills = await getSkills();
  const initialStats = await getSkillStats(skills.map((skill) => skill.slug));

  return (
    <StatsProvider initial={initialStats}>
      {children}
      {modal}
    </StatsProvider>
  );
}
