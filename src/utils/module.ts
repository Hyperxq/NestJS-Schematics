import { Path } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { DeclarationOptions, ModuleDeclarator, normalizeToKebabOrSnakeCase } from '@nestjs/schematics';
import { SchematicOptions } from '../builder-generate/resource/resource.schema';
import { ModuleFinder } from './module.finder';
import { parseName } from './parse-name';

export function addDeclarationToModule(options: SchematicOptions): Rule {
  return (tree: Tree, _context) => {
    const moduleOptions = transform(options);
    if (moduleOptions.skipImport !== undefined && moduleOptions.skipImport) {
      return tree;
    }
    moduleOptions.module = new ModuleFinder(tree).find({
      moduleName: moduleOptions.name,
      path: moduleOptions.sourceRoot as Path,
    })!;
    if (!moduleOptions.module) {
      return tree;
    }

    const content = tree.read(moduleOptions.module)?.toString();

    const declarator: ModuleDeclarator = new ModuleDeclarator();
    tree.overwrite(
      moduleOptions.module,
      declarator.declare(content ?? '', {
        ...moduleOptions,
        type: 'module',
      } as DeclarationOptions),
    );

    return tree;
  };
}

function transform(options: SchematicOptions): SchematicOptions {
  const target: SchematicOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }
  target.metadata = 'imports';

  const { name, sourceRoot } = options;
  const location = parseName(sourceRoot ?? '/', name);

  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.path = normalizeToKebabOrSnakeCase(location.path);

  return target;
}
