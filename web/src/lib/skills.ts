import fs from 'fs';
import path from 'path';

export interface SkillMetadata {
  name: string;
  description: string;
  path: string;
  slug: string;
  installName: string;
}

export interface Skill extends SkillMetadata {
  content: string;
}

interface SkillsDataset {
  generatedAt: string;
  skills: Skill[];
}

const DATASET_PATH = path.join(process.cwd(), 'data', 'skills.json');

let cachedDataset: SkillsDataset | null = null;

function loadSkillsDataset(): SkillsDataset {
  if (cachedDataset) {
    return cachedDataset;
  }

  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(
      `Missing generated skills dataset at ${DATASET_PATH}. Run "npm run generate:skills-data" from web/.`
    );
  }

  const fileContents = fs.readFileSync(DATASET_PATH, 'utf8');
  cachedDataset = JSON.parse(fileContents) as SkillsDataset;

  return cachedDataset;
}

export async function getSkills(): Promise<SkillMetadata[]> {
  return loadSkillsDataset().skills.map((skill) => ({
    name: skill.name,
    description: skill.description,
    path: skill.path,
    slug: skill.slug,
    installName: skill.installName,
  }));
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const skill = loadSkillsDataset().skills.find((entry) => entry.slug === slug);

  return skill ?? null;
}
