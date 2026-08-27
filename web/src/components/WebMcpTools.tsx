'use client';

import { useEffect, useRef } from 'react';
import {
  filterSkillsByQuery,
  getSkillDisplayDescription,
  getSkillDisplayName,
} from '@/lib/skill-catalog';
import { getSkillInstallCommand } from '@/lib/install-methods';
import { DEFAULT_SORT_KEY, getSkillComparator } from '@/lib/sorting';
import type { Skill, SkillMetadata } from '@/lib/skills';

interface WebMcpToolsProps {
  skills: SkillMetadata[];
  onOpenSkill: (skill: SkillMetadata) => void;
}

interface WebMcpExecuteOptions {
  signal: AbortSignal;
}

interface WebMcpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (
    input: Record<string, unknown>,
    options: WebMcpExecuteOptions
  ) => Promise<unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
}

interface WebMcpModelContext {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal }
  ) => Promise<void>;
}

type WebMcpDocument = Document & {
  modelContext?: WebMcpModelContext;
};

const DEFAULT_SEARCH_LIMIT = 10;
const MAX_SEARCH_LIMIT = 25;

function getModelContext(): WebMcpModelContext | null {
  const modelContext = (document as WebMcpDocument).modelContext;

  return modelContext && typeof modelContext.registerTool === 'function'
    ? modelContext
    : null;
}

function readStringInput(
  input: Record<string, unknown>,
  key: string,
  options: { required?: boolean } = {}
): string {
  const value = input[key];

  if (value == null && !options.required) {
    return '';
  }

  if (typeof value !== 'string' || (options.required && !value.trim())) {
    throw new Error(`${key} must be a non-empty string.`);
  }

  return value.trim();
}

function readSearchLimit(input: Record<string, unknown>): number {
  const value = input.limit;

  if (value == null) {
    return DEFAULT_SEARCH_LIMIT;
  }

  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_SEARCH_LIMIT
  ) {
    throw new Error(`limit must be an integer between 1 and ${MAX_SEARCH_LIMIT}.`);
  }

  return value;
}

function findSkillBySlug(skills: SkillMetadata[], slug: string): SkillMetadata {
  const skill = skills.find((entry) => entry.slug === slug);

  if (!skill) {
    throw new Error(`Unknown skill slug: ${slug}`);
  }

  return skill;
}

async function waitForUiUpdate(signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    throw signal.reason;
  }

  await new Promise<void>((resolve, reject) => {
    let frame = 0;
    const handleAbort = () => {
      window.cancelAnimationFrame(frame);
      reject(signal.reason);
    };

    signal.addEventListener('abort', handleAbort, { once: true });
    frame = window.requestAnimationFrame(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    });
  });
}

export function WebMcpTools({ skills, onOpenSkill }: WebMcpToolsProps) {
  const skillsRef = useRef(skills);
  const onOpenSkillRef = useRef(onOpenSkill);

  useEffect(() => {
    skillsRef.current = skills;
  }, [skills]);

  useEffect(() => {
    onOpenSkillRef.current = onOpenSkill;
  }, [onOpenSkill]);

  useEffect(() => {
    const modelContext = getModelContext();

    if (!modelContext) {
      return;
    }

    const registrationController = new AbortController();
    const tools: WebMcpTool[] = [
      {
        name: 'search_skills',
        title: 'Search Skills',
        description:
          "Search Flc's Skills by display name or description. An empty query lists the newest available skills.",
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Text to match against skill display names and descriptions.',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: MAX_SEARCH_LIMIT,
              default: DEFAULT_SEARCH_LIMIT,
              description: `Maximum number of results to return, from 1 to ${MAX_SEARCH_LIMIT}.`,
            },
          },
          additionalProperties: false,
        },
        annotations: {
          readOnlyHint: true,
          untrustedContentHint: true,
        },
        async execute(input) {
          const query = readStringInput(input, 'query');
          const limit = readSearchLimit(input);
          const matches = filterSkillsByQuery(skillsRef.current, query).sort(
            getSkillComparator(DEFAULT_SORT_KEY)
          );

          return {
            query,
            total: matches.length,
            results: matches.slice(0, limit).map((skill) => ({
              slug: skill.slug,
              name: getSkillDisplayName(skill),
              description: getSkillDisplayDescription(skill),
              installName: skill.installName,
              fileCount: skill.fileCount,
            })),
          };
        },
      },
      {
        name: 'get_skill_detail',
        title: 'Get Skill Detail',
        description:
          "Get the full metadata and Markdown content for one skill from Flc's Skills.",
        inputSchema: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              minLength: 1,
              description: 'The exact skill slug returned by search_skills.',
            },
          },
          required: ['slug'],
          additionalProperties: false,
        },
        annotations: {
          readOnlyHint: true,
          untrustedContentHint: true,
        },
        async execute(input, { signal }) {
          const slug = readStringInput(input, 'slug', { required: true });
          findSkillBySlug(skillsRef.current, slug);

          const response = await fetch(`/api/skills/${encodeURIComponent(slug)}`, {
            signal,
          });

          if (!response.ok) {
            throw new Error(
              response.status === 404
                ? `Unknown skill slug: ${slug}`
                : `Unable to load skill detail (${response.status}).`
            );
          }

          return (await response.json()) as Skill;
        },
      },
      {
        name: 'get_install_command',
        title: 'Get Install Command',
        description:
          "Get the individual npx installation command for one skill from Flc's Skills.",
        inputSchema: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              minLength: 1,
              description: 'The exact skill slug returned by search_skills.',
            },
          },
          required: ['slug'],
          additionalProperties: false,
        },
        annotations: {
          readOnlyHint: true,
        },
        async execute(input) {
          const slug = readStringInput(input, 'slug', { required: true });
          const skill = findSkillBySlug(skillsRef.current, slug);

          return {
            slug: skill.slug,
            name: getSkillDisplayName(skill),
            installName: skill.installName,
            command: getSkillInstallCommand(skill.installName),
          };
        },
      },
      {
        name: 'open_skill',
        title: 'Open Skill',
        description:
          "Open one skill's detail modal in the current Flc's Skills browser tab.",
        inputSchema: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              minLength: 1,
              description: 'The exact skill slug returned by search_skills.',
            },
          },
          required: ['slug'],
          additionalProperties: false,
        },
        async execute(input, { signal }) {
          const slug = readStringInput(input, 'slug', { required: true });
          const skill = findSkillBySlug(skillsRef.current, slug);

          onOpenSkillRef.current(skill);
          await waitForUiUpdate(signal);

          return {
            opened: true,
            slug: skill.slug,
            name: getSkillDisplayName(skill),
            url: window.location.href,
          };
        },
      },
    ];

    const registerTools = async () => {
      try {
        for (const tool of tools) {
          await modelContext.registerTool(tool, {
            signal: registrationController.signal,
          });
        }
      } catch (error) {
        if (!registrationController.signal.aborted) {
          registrationController.abort();

          if (process.env.NODE_ENV !== 'production') {
            console.warn('WebMCP tools could not be registered:', error);
          }
        }
      }
    };

    void registerTools();

    return () => registrationController.abort();
  }, []);

  return null;
}
