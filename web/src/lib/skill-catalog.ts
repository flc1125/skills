import type { SkillMetadata } from './skills';

export function getSkillDisplayName(skill: SkillMetadata): string {
  return skill.metadata?.name ?? skill.name;
}

export function getSkillDisplayDescription(skill: SkillMetadata): string {
  return skill.metadata?.description ?? skill.description;
}

export function filterSkillsByQuery(
  skills: SkillMetadata[],
  query: string
): SkillMetadata[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [...skills];
  }

  return skills.filter((skill) => {
    const displayName = getSkillDisplayName(skill);
    const displayDescription = getSkillDisplayDescription(skill);

    return (
      displayName.toLowerCase().includes(normalizedQuery) ||
      displayDescription.toLowerCase().includes(normalizedQuery)
    );
  });
}
