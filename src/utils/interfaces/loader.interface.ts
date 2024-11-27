import { Tree } from '@angular-devkit/schematics';
import { SourceSpecificProperties } from './source-specific-properties.type';

export interface Loader<Input = SourceSpecificProperties> {
  getData: (tree: Tree, sourceRoot: string) => Promise<Input>;
  // getSubElements: () =>
}
