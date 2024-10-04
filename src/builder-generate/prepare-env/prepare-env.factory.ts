import { Rule } from '@angular-devkit/schematics';

export function prepareEnvFactory(): Rule {
  return () => {
    // TODO: That will invoke in the builder-add. The purpose of this schematic is to make all the preparation
    // TODO: to start to use a nestjs project with all the configurations.
  };
}
