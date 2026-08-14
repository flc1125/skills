import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import matter from 'gray-matter';
import { glob } from 'glob';
import { create as createTar } from 'tar';

const DISCOVERY_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_DESCRIPTION_LENGTH = 1024;
const ARCHIVE_MTIME = new Date(0);
const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(scriptDir, '..');
const repoRoot = path.join(webDir, '..');
const skillsDir = path.join(repoRoot, 'skills');
const outputDir = path.join(webDir, 'public', '.well-known', 'agent-skills');
const artifactsDir = path.join(outputDir, 'artifacts');

function validateSkillMetadata(directoryName, metadata) {
  const { name, description } = metadata;

  if (typeof name !== 'string' || !SKILL_NAME_PATTERN.test(name) || name.length > 64) {
    throw new Error(`${directoryName}: invalid skill name`);
  }

  if (name !== directoryName) {
    throw new Error(`${directoryName}: directory name must match frontmatter name "${name}"`);
  }

  if (
    typeof description !== 'string' ||
    description.length === 0 ||
    description.length > MAX_DESCRIPTION_LENGTH
  ) {
    throw new Error(`${directoryName}: description must contain 1-${MAX_DESCRIPTION_LENGTH} characters`);
  }
}

async function createSkillArchive(skillDir, files) {
  const archive = createTar(
    {
      cwd: skillDir,
      gzip: { level: 9 },
      mtime: ARCHIVE_MTIME,
      portable: true,
      prefix: '',
      sync: true,
    },
    files
  );

  return archive.concat();
}

async function listSkillFiles(directoryName) {
  const skillPath = path.posix.join('skills', directoryName);
  let stdout;

  try {
    ({ stdout } = await execFileAsync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', skillPath],
      {
        cwd: repoRoot,
        encoding: 'buffer',
        maxBuffer: 1024 * 1024,
      }
    ));
  } catch (error) {
    throw new Error(
      'Unable to enumerate publishable skill files. Run the build from a Git checkout.',
      { cause: error }
    );
  }

  const prefix = `${skillPath}/`;
  const files = stdout
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((file) => {
      if (!file.startsWith(prefix)) {
        throw new Error(`${directoryName}: unexpected file outside skill directory: ${file}`);
      }

      return file.slice(prefix.length);
    })
    .sort();

  for (const file of files) {
    const stats = await lstat(path.join(skillsDir, directoryName, file));

    if (!stats.isFile()) {
      throw new Error(`${directoryName}: archive entries must be regular files: ${file}`);
    }
  }

  return files;
}

async function main() {
  const skillFiles = await glob('*/SKILL.md', { cwd: skillsDir });
  const skillDirectories = skillFiles.map((file) => path.dirname(file)).sort();

  if (skillDirectories.length === 0) {
    throw new Error(`No skills found in ${skillsDir}`);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(artifactsDir, { recursive: true });

  const entries = [];

  for (const directoryName of skillDirectories) {
    const skillDir = path.join(skillsDir, directoryName);
    const skillMd = await readFile(path.join(skillDir, 'SKILL.md'), 'utf8');
    const { data } = matter(skillMd);
    validateSkillMetadata(directoryName, data);

    const files = await listSkillFiles(directoryName);

    if (!files.includes('SKILL.md')) {
      throw new Error(`${directoryName}: archive is missing SKILL.md`);
    }

    const archive = await createSkillArchive(skillDir, files);
    const digestHex = createHash('sha256').update(archive).digest('hex');
    const artifactName = `${data.name}-${digestHex}.tar.gz`;
    const temporaryPath = path.join(artifactsDir, `${artifactName}.tmp`);
    const artifactPath = path.join(artifactsDir, artifactName);

    await writeFile(temporaryPath, archive);
    await rename(temporaryPath, artifactPath);

    entries.push({
      name: data.name,
      type: 'archive',
      description: data.description,
      url: `artifacts/${artifactName}`,
      digest: `sha256:${digestHex}`,
    });
  }

  const index = {
    $schema: DISCOVERY_SCHEMA,
    skills: entries,
  };

  await writeFile(path.join(outputDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Generated ${entries.length} skill artifacts into ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
