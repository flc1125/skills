import type { MetadataRoute } from 'next';
import { getSkills } from '@/lib/skills';
import { parseSkillMetadataDate } from '@/lib/utils';

const BASE_URL = 'https://skills.flc.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const skills = await getSkills();

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...skills.map((skill) => ({
      url: `${BASE_URL}/${skill.slug}`,
      lastModified: parseSkillMetadataDate(skill.metadata?.created) ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
