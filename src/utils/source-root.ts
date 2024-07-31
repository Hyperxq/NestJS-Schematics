import { getValueOrDefault } from '@nestjs/cli/lib/compiler/helpers/get-value-or-default';
import { loadConfiguration } from '@nestjs/cli/lib/utils/load-configuration';
import { askForProjectName, moveDefaultProjectToStart, shouldAskForProject } from '@nestjs/cli/lib/utils/project-utils';

export interface Input {
  name: string;
  value: boolean | string;
  options?: any;
}

const schematicName = 'nest-add';

export async function getSourceRoot(inputs: Input[]): Promise<string> {
  const configuration = await loadConfiguration();
  const configurationProjects = configuration.projects;

  const appName = inputs.find((option) => option?.name === 'project')?.value as string;

  let sourceRoot = appName ? getValueOrDefault(configuration, 'sourceRoot', appName) : configuration.sourceRoot;

  const shouldAsk = shouldAskForProject(schematicName, configurationProjects, appName);
  if (shouldAsk) {
    const defaultLabel = ' [ Default ]';
    let defaultProjectName = configuration.sourceRoot + defaultLabel;

    for (const property in configurationProjects) {
      if (configurationProjects[property].sourceRoot === configuration.sourceRoot) {
        defaultProjectName = property + defaultLabel;
        break;
      }
    }

    const projects = moveDefaultProjectToStart(configuration, defaultProjectName, defaultLabel);

    const answers = await askForProjectName('Which project would you like to add the library to?', projects);
    const project = answers.appName.replace(defaultLabel, '');
    if (project !== configuration.sourceRoot) {
      sourceRoot = configurationProjects[project].sourceRoot;
    }
  }

  return sourceRoot;
}
