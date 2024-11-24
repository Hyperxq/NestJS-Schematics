import {
  MergeStrategy,
  Rule,
  apply,
  applyTemplates,
  filter,
  mergeWith,
  move,
  renameTemplateFiles,
  strings,
  url,
} from '@angular-devkit/schematics';

export function prepareEnvFactory(): Rule {
  return () => {
    // TODO: That will invoke in the builder-add. The purpose of this schematic is to make all the preparation
    // TODO: to start to use a nestjs project with all the configurations.
    // ? Add the env file

    const urlTemplates = ['.env.template', 'docker-compose.yml.template', 'Dockerfile.template'];
    const template = apply(url('./files'), [
      filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
      applyTemplates({
        ...strings,
      }),
      renameTemplateFiles(),
      move('./'),
    ]);

    return mergeWith(template, MergeStrategy.AllowCreationConflict);
  };
}
