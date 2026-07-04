export type InstallCommand = {
  label: string;
  command: string;
};

export type InstallMethod = {
  id: string;
  label: string;
  description: string;
  scope: 'repository' | 'skill';
  status: 'available' | 'planned';
  commands: InstallCommand[];
};

export const repositoryInstallMethods: InstallMethod[] = [
  {
    id: 'codex',
    label: 'Codex',
    description: 'Install the marketplace once, then add the bundled skills plugin to make the full collection available in Codex.',
    scope: 'repository',
    status: 'available',
    commands: [
      {
        label: 'Add marketplace',
        command: 'codex plugin marketplace add flc1125/skills',
      },
      {
        label: 'Install plugin',
        command: 'codex plugin add skills@flc-skills',
      },
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    description: 'Mock install flow for upcoming Claude plugin support. Commands are placeholders until the real Claude plugin distribution is available.',
    scope: 'repository',
    status: 'available',
    commands: [
      {
        label: 'Mock add marketplace',
        command: 'claude plugin marketplace add flc1125/skills',
      },
      {
        label: 'Mock install plugin',
        command: 'claude plugin add skills@flc-skills',
      },
    ],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: 'Mock install flow for upcoming Gemini plugin support. Commands are placeholders until the real Gemini plugin distribution is available.',
    scope: 'repository',
    status: 'available',
    commands: [
      {
        label: 'Mock add marketplace',
        command: 'gemini plugin marketplace add flc1125/skills',
      },
      {
        label: 'Mock install plugin',
        command: 'gemini plugin add skills@flc-skills',
      },
    ],
  },
];

export const availableRepositoryInstallMethods = repositoryInstallMethods.filter(
  (method) => method.scope === 'repository' && method.status === 'available'
);
