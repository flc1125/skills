import type { SkillInteraction, SkillStats } from '@/lib/skill-stats';

export async function recordSkillInteraction(
  slug: string,
  interaction: SkillInteraction
): Promise<SkillStats | null> {
  try {
    const response = await fetch(`/api/stats/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interaction }),
      keepalive: true,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { stats?: SkillStats };
    return payload.stats ?? null;
  } catch (error) {
    console.error('Failed to record skill interaction:', error);
    return null;
  }
}
