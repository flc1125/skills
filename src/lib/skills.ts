import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

export interface SkillMetadata {
  name: string;
  description: string;
  category: string;
  icon?: string;
  tags?: string[];
  path: string;
  slug: string;
}

export interface Skill extends SkillMetadata {
  content: string;
}

const SKILLS_DIR = path.join(process.cwd(), 'skills');

export async function getSkills(): Promise<SkillMetadata[]> {
  const files = await glob('**/SKILL.md', { cwd: SKILLS_DIR });

  const skills = files.map((file) => {
    const fullPath = path.join(SKILLS_DIR, file);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    // Default category from directory if not provided
    const category = data.category || path.dirname(file).split(path.sep)[0];
    
    // Create a slug from the file path
    const slug = path.dirname(file).replace(/[/\\]/g, '-');

    return {
      ...(data as SkillMetadata),
      category,
      path: file,
      slug,
    };
  });

  return skills.sort((a, b) => (a.name > b.name ? 1 : -1));
}

export async function getSkillBySlug(slug: string): Promise<Skill | null> {
  const skills = await getSkills();
  const skillMeta = skills.find((s) => s.slug === slug);

  if (!skillMeta) return null;

  const fullPath = path.join(SKILLS_DIR, skillMeta.path);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    ...(data as SkillMetadata),
    category: skillMeta.category,
    path: skillMeta.path,
    slug: skillMeta.slug,
    content,
  };
}
