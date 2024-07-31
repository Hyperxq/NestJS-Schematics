import { Rule, SchematicContext, Tree, branchAndMerge, chain } from '@angular-devkit/schematics';
import { addFilesToTree, getRelativePath, getSourceRoot, parseName } from '../../utils';
import { SchematicOptions } from '../resource/resource.schema';
import { SchemaQuestion } from './questions.terminal';

export function schemaFactory(options: SchematicOptions): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {
    if (getRelativePath(process.cwd()) !== '/') {
      options.sourceRoot = '/';
    }

    if (!options.sourceRoot) {
      options.sourceRoot = await getSourceRoot([]);
    }

    if (!options.name) {
      do {
        options.name = await SchemaQuestion();
      } while (!options.name);
    }

    const { path, name } = parseName(options.sourceRoot, options.name);
    options.sourceRoot = path;
    options.name = name;

    return branchAndMerge(chain([addSchemaFile(options)]));
  };
}

function addSchemaFile({ name, sourceRoot }: SchematicOptions) {
  return addFilesToTree({ name }, `${sourceRoot}`, ['__name@singular@dasherize__.schema.ts.template'], './files');
}
