import type { SkillMetadata } from './skills';
import type { SkillStatsSnapshot } from './skill-stats';
import { parseSkillMetadataDate } from './utils';

export type SortKey =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'views-desc'
  | 'copies-desc';

export interface SortOption {
  key: SortKey;
  label: string;
  requiresStats: boolean;
}

export const DEFAULT_SORT_KEY: SortKey = 'newest';

export const SORT_OPTIONS: SortOption[] = [
  { key: 'newest', label: 'Newest', requiresStats: false },
  { key: 'oldest', label: 'Oldest', requiresStats: false },
  { key: 'name-asc', label: 'Name A–Z', requiresStats: false },
  { key: 'name-desc', label: 'Name Z–A', requiresStats: false },
  { key: 'views-desc', label: 'Most viewed', requiresStats: true },
  { key: 'copies-desc', label: 'Most copied', requiresStats: true },
];

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === 'string' && SORT_OPTIONS.some((option) => option.key === value);
}

export function normalizeSortKey(value: string | null | undefined): SortKey {
  return isSortKey(value) ? value : DEFAULT_SORT_KEY;
}

export function isStatsSortKey(key: SortKey): boolean {
  return SORT_OPTIONS.find((option) => option.key === key)?.requiresStats ?? false;
}

function displayNameOf(skill: SkillMetadata): string {
  return skill.metadata?.name ?? skill.name;
}

function createdTimeOf(skill: SkillMetadata): number | null {
  const date = parseSkillMetadataDate(skill.metadata?.created);
  return date ? date.getTime() : null;
}

function compareDisplayNames(left: SkillMetadata, right: SkillMetadata): number {
  return displayNameOf(left).localeCompare(displayNameOf(right), undefined, {
    sensitivity: 'base',
  });
}

// Skills without a creation date sort last regardless of direction.
function compareCreated(
  left: SkillMetadata,
  right: SkillMetadata,
  ascending: boolean
): number {
  const leftTime = createdTimeOf(left);
  const rightTime = createdTimeOf(right);

  if (leftTime !== null && rightTime !== null) {
    return ascending ? leftTime - rightTime : rightTime - leftTime;
  }

  if (leftTime === null && rightTime === null) {
    return compareDisplayNames(left, right);
  }

  return leftTime === null ? 1 : -1;
}

function compareInteraction(
  left: SkillMetadata,
  right: SkillMetadata,
  stats: SkillStatsSnapshot | undefined,
  field: 'views' | 'copies'
): number {
  const leftCount = stats?.skills[left.slug]?.[field] ?? 0;
  const rightCount = stats?.skills[right.slug]?.[field] ?? 0;

  if (leftCount !== rightCount) {
    return rightCount - leftCount;
  }

  return compareDisplayNames(left, right);
}

export function getSkillComparator(
  key: SortKey,
  stats?: SkillStatsSnapshot
): (left: SkillMetadata, right: SkillMetadata) => number {
  switch (key) {
    case 'oldest':
      return (left, right) => compareCreated(left, right, true);
    case 'name-asc':
      return (left, right) => compareDisplayNames(left, right);
    case 'name-desc':
      return (left, right) => compareDisplayNames(right, left);
    case 'views-desc':
      return (left, right) => compareInteraction(left, right, stats, 'views');
    case 'copies-desc':
      return (left, right) => compareInteraction(left, right, stats, 'copies');
    case 'newest':
    default:
      return (left, right) => compareCreated(left, right, false);
  }
}
