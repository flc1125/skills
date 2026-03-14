import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

const SKILLS_DIR = path.join(process.cwd(), 'skills');
const OUTPUT_FILE = path.join(process.cwd(), 'src/lib/skills-data.json');

async function sync() {
  console.log('🔄 Syncing skills metadata...');
  
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('❌ Skills directory not found:', SKILLS_DIR);
    process.exit(1);
  }

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

  const sortedSkills = skills.sort((a, b) => a.name.localeCompare(b.name));
  
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedSkills, null, 2));
  console.log(`✅ Successfully synced ${sortedSkills.length} skills to ${OUTPUT_FILE}`);
}

sync().catch(err => {
  console.error('❌ Failed to sync skills:', err);
  process.exit(1);
});
