import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { glob } from 'glob';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(scriptDir, '..');
const repoRoot = path.join(webDir, '..');
const skillsDir = path.join(repoRoot, 'skills');
const outputDir = path.join(webDir, 'data');
const outputPath = path.join(outputDir, 'skills.json');

function toSlug(filePath) {
  return path.dirname(filePath).replace(/[/\\]/g, '-');
}

async function main() {
  const files = await glob('**/SKILL.md', { cwd: skillsDir });

  const skills = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(skillsDir, file);
      const fileContents = await readFile(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        name: data.name,
        description: data.description,
        path: file,
        slug: toSlug(file),
        installName: data.name,
        content,
      };
    })
  );

  skills.sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    generatedAt: new Date().toISOString(),
    skills,
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Generated ${skills.length} skills into ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
