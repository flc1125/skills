import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

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

const SKILLS_DIR = path.join(process.cwd(), 'skills');
const METADATA_FILE = path.join(process.cwd(), 'src/lib/skills-data.json');

// Module-level cache to store metadata in memory after the first read
let cachedSkills: SkillMetadata[] | null = null;

export async function getSkills(): Promise<SkillMetadata[]> {
  // Return from memory if available
  if (cachedSkills) return cachedSkills;

  // If the metadata file exists, use it directly
  if (fs.existsSync(METADATA_FILE)) {
    try {
      const data = fs.readFileSync(METADATA_FILE, 'utf8');
      cachedSkills = JSON.parse(data);
      return cachedSkills!;
    } catch (error) {
      console.error('Failed to read skills metadata file, falling back to dynamic scan:', error);
    }
  }

  // Fallback when the metadata file is missing or unreadable
  const files = await glob('**/SKILL.md', { cwd: SKILLS_DIR });

  const skills = files.map((file) => {
    const fullPath = path.join(SKILLS_DIR, file);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    const slug = path.dirname(file).replace(/[/\\]/g, '-');

    return {
      name: data.name,
      description: data.description,
      path: file,
      slug,
      installName: data.name,
    };
  });

  cachedSkills = skills.sort((a, b) => (a.name > b.name ? 1 : -1));
  return cachedSkills;
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const skills = await getSkills();
  const skillMeta = skills.find((s) => s.slug === slug);

  if (!skillMeta) return null;

  const fullPath = path.join(SKILLS_DIR, skillMeta.path);
  
  // Only read the content for the specific skill requested
  if (!fs.existsSync(fullPath)) return null;
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    name: data.name,
    description: data.description,
    path: skillMeta.path,
    slug: skillMeta.slug,
    installName: skillMeta.installName,
    content,
  };
}
