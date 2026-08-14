import 'server-only';

import { Redis } from '@upstash/redis';

export type SkillInteraction = 'view' | 'copy';

export interface SkillStats {
  views: number;
  copies: number;
}

export interface SkillStatsSnapshot {
  enabled: boolean;
  skills: Record<string, SkillStats>;
}

const STATS_KEY = 'flc-skills:stats:v1';
const VIEW_TTL_SECONDS = 24 * 60 * 60;
const COPY_TTL_SECONDS = 10;

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const hasRedisUrl = Boolean(
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  );
  const hasRedisToken = Boolean(
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  );

  if (!hasRedisUrl || !hasRedisToken) {
    redisClient = null;
    return redisClient;
  }

  redisClient = Redis.fromEnv();
  return redisClient;
}

function toCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function emptyStats(slugs: string[]): Record<string, SkillStats> {
  return Object.fromEntries(
    slugs.map((slug) => [slug, { views: 0, copies: 0 }])
  );
}

function statsField(slug: string, interaction: SkillInteraction) {
  return `${slug}:${interaction === 'view' ? 'views' : 'copies'}`;
}

export function isSkillStatsEnabled(): boolean {
  return getRedis() !== null;
}

export async function getSkillStats(
  slugs: string[]
): Promise<SkillStatsSnapshot> {
  const redis = getRedis();

  if (!redis || slugs.length === 0) {
    return {
      enabled: redis !== null,
      skills: emptyStats(slugs),
    };
  }

  try {
    const fields = slugs.flatMap((slug) => [
      statsField(slug, 'view'),
      statsField(slug, 'copy'),
    ]);
    const values =
      (await redis.hmget<Record<string, number | string | null>>(
        STATS_KEY,
        ...fields
      )) ?? {};
    const skills: Record<string, SkillStats> = {};

    slugs.forEach((slug) => {
      skills[slug] = {
        views: toCount(values[statsField(slug, 'view')]),
        copies: toCount(values[statsField(slug, 'copy')]),
      };
    });

    return { enabled: true, skills };
  } catch (error) {
    console.error('Failed to load skill statistics:', error);
    return { enabled: false, skills: emptyStats(slugs) };
  }
}

export async function recordSkillInteraction(
  slug: string,
  interaction: SkillInteraction,
  visitorId: string
): Promise<{ counted: boolean; stats: SkillStats } | null> {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  try {
    const ttl = interaction === 'view' ? VIEW_TTL_SECONDS : COPY_TTL_SECONDS;
    const dedupeKey = `flc-skills:${interaction}:v1:${slug}:${visitorId}`;
    const shouldCount = await redis.set(dedupeKey, '1', {
      nx: true,
      ex: ttl,
    });

    if (shouldCount) {
      await redis.hincrby(STATS_KEY, statsField(slug, interaction), 1);
    }

    const snapshot = await getSkillStats([slug]);

    return snapshot.enabled
      ? {
          counted: Boolean(shouldCount),
          stats: snapshot.skills[slug],
        }
      : null;
  } catch (error) {
    console.error('Failed to record skill interaction:', error);
    return null;
  }
}
