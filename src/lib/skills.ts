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

export async function getSkills(): Promise<SkillMetadata[]> {
  const files = await glob('**/SKILL.md', { cwd: SKILLS_DIR });

  const skills = files.map((file) => {
    const fullPath = path.join(SKILLS_DIR, file);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    // Create a slug from the file path
    const slug = path.dirname(file).replace(/[/\\]/g, '-');

    return {
      name: data.name,
      description: data.description,
      path: file,
      slug,
      installName: data.name,
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
    name: data.name,
    description: data.description,
    path: skillMeta.path,
    slug: skillMeta.slug,
    installName: skillMeta.installName,
    content,
  };
}
