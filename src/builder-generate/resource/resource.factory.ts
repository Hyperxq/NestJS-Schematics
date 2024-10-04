import { Rule, SchematicContext, Tree, branchAndMerge, chain } from '@angular-devkit/schematics';

import { MergeStrategy } from '@angular-devkit/schematics/src/tree/interface';
import {
  addDeclarationToModule,
  addFilesToTree,
  getRelativePath,
  getSourceRoot,
  loadAndParseSchema,
} from '../../utils';
import { SchemaInfo } from './resource.interfaces';
import { SchematicOptions } from './resource.schema';

export function resourceFactory(options: SchematicOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const relativePath = getRelativePath(process.cwd());
    if (relativePath === '/') {
      if (!options.sourceRoot) {
        console.log('Source Root not found');
        options.sourceRoot = await getSourceRoot([]);
      }
    } else {
      options.sourceRoot = '/';
    }

    const response = await loadAndParseSchema(options, tree, context);

    if (!response) {
      return;
    }
    // const { schema, subSchemas } = response;
    // console.log(schema.name);
    // console.log(`Does ${schema.name} have sub-schema: ${(subSchemas ?? []).length > 0}`);
    // console.table(schema.properties);

    // return branchAndMerge(chain([getSchemaRules(schema), getSubSchemaRules(subSchemas)]), MergeStrategy.ContentOnly);
  };
}

function getSchemaRules(schema: SchemaInfo): Rule {
  const { path, name, properties, skipIndexes } = schema;
  const propertyArray = Object.entries(properties);

  console.table(properties);

  return chain([
    addEntities({ name, sourceRoot: path }, propertyArray),
    addDTOs({ name, sourceRoot: path }, propertyArray, skipIndexes),
    addModule({ name, sourceRoot: path }, propertyArray),
    addResolver({ name, sourceRoot: path }, propertyArray),
    addService({ name, sourceRoot: path }, propertyArray),
    addRepository({ name, sourceRoot: path }, propertyArray),
    addDeclarationToModule({ name, sourceRoot: path }),
  ]);
}

function getSubSchemaRules(subSchemas: SchemaInfo[]): Rule {
  return chain(
    subSchemas.map(({ name, path, properties, skipIndexes }) => {
      return chain([
        addEntities({ name, sourceRoot: path }, Object.entries(properties)),
        addDTOs({ name, sourceRoot: path }, Object.entries(properties), skipIndexes),
      ]);
    }),
  );
}

function addDTOs(
  { name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>,
  jsonOptions: {}[],
  skipIndexes: boolean = false,
): Rule {
  return addFilesToTree(
    { name, keys: jsonOptions, skipIndexes },
    `${sourceRoot}`,
    [
      'create-__name@singular@dasherize__.input.dto.ts.template',
      'get-__name@singular@dasherize__.input.dto.ts.template',
      'update-__name@singular@dasherize__.input.dto.ts.template',
    ],
    './files',
  );
}

function addEntities({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>, jsonOptions: {}[]) {
  return addFilesToTree(
    { name, keys: jsonOptions },
    `${sourceRoot}`,
    ['__name@singular@dasherize@ent__.ts.template'],
    './files',
  );
}

function addModule({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>, jsonOptions: {}[]) {
  return addFilesToTree(
    { name, keys: jsonOptions },
    `${sourceRoot}`,
    ['__name@dasherize__.module.ts.template'],
    './files',
  );
}

function addResolver({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>, jsonOptions: {}[]) {
  return addFilesToTree(
    { name, keys: jsonOptions },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.resolver.ts.template'],
    './files',
  );
}

function addService({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>, jsonOptions: {}[]) {
  return addFilesToTree(
    { name, keys: jsonOptions },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.service.ts.template'],
    './files',
  );
}

function addRepository({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>, jsonOptions: {}[]) {
  return addFilesToTree(
    { name, keys: jsonOptions },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.repository.ts.template'],
    './files',
  );
}
