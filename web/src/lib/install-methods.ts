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
    description: 'Claude plugin support is planned, but it is not available yet.',
    scope: 'repository',
    status: 'planned',
    commands: [],
  },
];

export const visibleRepositoryInstallMethods = repositoryInstallMethods.filter(
  (method) => method.scope === 'repository'
);
