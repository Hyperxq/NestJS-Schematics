/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Rule, chain, schematic } from '@angular-devkit/schematics';

export function builderAddFactory({
  skipPreparation,
  packageManager,
}: {
  skipPreparation: boolean;
  packageManager: string;
}): Rule {
  return () => {
    if (skipPreparation) {
      return;
    }

    return chain([schematic('prepare-env', {}), schematic('install-dependencies', { kind: 'GraphQL-Mongoose' })]);
  };
}
