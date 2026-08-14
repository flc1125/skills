import { getSkills } from '@/lib/skills';
import { getSkillStats } from '@/lib/skill-stats';
import { NextResponse } from 'next/server';

export async function GET() {
  const skills = await getSkills();
  const snapshot = await getSkillStats(skills.map((skill) => skill.slug));

  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
