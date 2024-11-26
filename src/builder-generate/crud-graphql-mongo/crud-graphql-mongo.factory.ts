import { join, normalize } from '@angular-devkit/core';
import { Rule, SchematicContext, SchematicsException, Tree, chain, strings } from '@angular-devkit/schematics';
import * as pluralize from 'pluralize';
import { ImportDeclaration } from 'typescript';
import {
  addDeclarationToModule,
  addFilesToTree,
  createImportStatement,
  createImportsStatement,
  getImportAsText,
  getImportsAsText,
  getRelativePath,
  getSourceRoot,
  loadAndParseSchema,
} from '../../utils';
import { addShortImportToTsConfig } from '../../utils/AST';
import { OutputType } from '../../utils/enums/output-types.enum';
import { SourceType } from '../../utils/enums/source-types.enum';
import { MainFactory } from '../../utils/factories/main-factory';
import { ContentResult } from '../../utils/interfaces/property-factory.interfaces';
import { SchematicOptions } from './crud-graphql-mongo.schema';
import { moduleImportsData, repositoryImportData, resolverImportsData, serviceImportsData } from './imports.data';
import { moduleProvidersData } from './providers.data';

export function crudGraphqlMongoFactory(options: SchematicOptions) {
  /*
   * 1. read the source (json, entity, schema) (regex -> AST)
   *  To create a file we need: create imports
   * 2. addEntities
   * 3. addDTOs
   * 4. addModule
   * 5. addResolver
   * 6. addService
   * 7. addRepository
   * 8. addDeclarationToModule
   */
  // * When we add a new file, we need to pass a complex object that allows to everyfile has the logic.
  return async (tree: Tree, context: SchematicContext) => {
    const relativePath = getRelativePath(process.cwd());
    if (relativePath === '/') {
      if (!options.sourceRoot) {
        options.sourceRoot = await getSourceRoot([]);
      }
    } else {
      options.sourceRoot = '/';
    }

    const schemas = await loadAndParseSchema(options, tree, context);
    const rules: Rule[] = [];
    // Send all the properties and info.
    // We need to send  all the properties per schema with name and path.

    // TODO: for now we will generate entities in the simple way, we need to support all the types of properties.
    const factory = new MainFactory(SourceType.MongooseSchema, OutputType.GRAPHQL, schemas, options.sourceRoot, tree);

    rules.push(addCommonFiles({ sourceRoot: options.sourceRoot }));
    schemas
      .filter(({ mainSchema }) => mainSchema)
      .forEach(({ name, path }) => {
        rules.push(addRepository({ name, sourceRoot: path }));
        rules.push(addService({ name, sourceRoot: path }));
        rules.push(addResolver({ name, sourceRoot: path }));
        rules.push(addModule({ name, sourceRoot: path }));
        rules.push(addDeclarationToModule({ name, sourceRoot: path }));
      });

    const getDTOs: ContentResult[] = factory.generateGetDTO();
    const createDTOs: ContentResult[] = factory.generateCreateDTO();
    const updateDTOs: ContentResult[] = factory.generateUpdateDTO();
    const entities: ContentResult[] = factory.generateEntity();

    getDTOs.forEach((contentResult) => {
      rules.push(addDTO(contentResult, 'GET'));
    });
    createDTOs.forEach((contentResult) => {
      rules.push(addDTO(contentResult, 'CREATE'));
    });
    updateDTOs.forEach((contentResult) => {
      rules.push(addDTO(contentResult, 'UPDATE'));
    });
    entities.forEach((contentResult) => {
      rules.push(addEntity(contentResult));
    });

    return chain(rules);
  };
}

function addEntity({ name, content, path, imports }: ContentResult): Rule {
  return addFilesToTree(
    { name, content, imports },
    `${path}`,
    ['__name@singular@dasherize@ent__.ts.template'],
    './files',
  );
}

function addDTO({ name, content, path, imports }: ContentResult, dtoType: 'GET' | 'UPDATE' | 'CREATE'): Rule {
  const DTOMap = {
    GET: 'get-__name@singular@dasherize__.input.dto.ts.template',
    CREATE: 'create-__name@singular@dasherize__.input.dto.ts.template',
    UPDATE: 'update-__name@singular@dasherize__.input.dto.ts.template',
  };

  return addFilesToTree({ name, content, imports }, `${path}`, [DTOMap[dtoType]], './files');
}

function addRepository({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>) {
  const nameSinglularClassify = pluralize.singular(strings.classify(name));
  const nameSinglularDasherize = toSinglularDasherize(name);
  const { identifiers, moduleSpecifier } = repositoryImportData(nameSinglularClassify, nameSinglularDasherize);
  const importInput: ImportDeclaration = createImportStatement(identifiers as string[], moduleSpecifier);
  const importText = getImportAsText(importInput);

  // TODO: add the common configs files to the project.
  // * For now we can assume the we are using a single project.
  // TODO: check if the workspace is a single project or multiproject.

  return addFilesToTree(
    { name: nameSinglularClassify, importText },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.repository.ts.template'],
    './files',
  );
}

function addService({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>) {
  const nameSinglularClassify = toSinglularClassify(name);
  const nameSinglularDasherize = toSinglularDasherize(name);

  const importsInput: ImportDeclaration[] = createImportsStatement(
    serviceImportsData(nameSinglularClassify, nameSinglularDasherize),
  );

  return addFilesToTree(
    { name: nameSinglularClassify, imports: getImportsAsText(importsInput) },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.service.ts.template'],
    './files',
  );
}

function addCommonFiles({ sourceRoot }: Pick<SchematicOptions, 'sourceRoot'>) {
  return (tree: Tree) => {
    // TODO: What happen if we are not in root
    const tsconfigPath = normalize('/tsconfig.json');

    if (!tree.exists(tsconfigPath)) {
      throw new SchematicsException(`tsconfig.json not found at path: ${tsconfigPath}`);
    }

    // Read the existing tsconfig.json content
    let tsconfigContent = tree.readText(tsconfigPath);
    if (!tsconfigContent) {
      throw new SchematicsException(`Failed to read tsconfig.json at path: ${tsconfigPath}`);
    }

    tsconfigContent = addShortImportToTsConfig(tsconfigContent, '@app/common', 'src/common');

    tree.overwrite(tsconfigPath, tsconfigContent);

    return addFilesToTree(
      {},
      `${sourceRoot}`,
      ['abstract.repository.ts.template', 'database.module.ts.template', 'index.ts.template'],
      './files/single-project',
    );
  };
}

function addResolver({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>) {
  const nameSinglularClassify = toSinglularClassify(name);
  const nameSinglularDasherize = toSinglularDasherize(name);

  const importsInput: ImportDeclaration[] = createImportsStatement(
    resolverImportsData(nameSinglularClassify, nameSinglularDasherize),
  );

  return addFilesToTree(
    { name: nameSinglularClassify, imports: getImportsAsText(importsInput) },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.resolver.ts.template'],
    './files',
  );
}

function addModule({ name, sourceRoot }: Pick<SchematicOptions, 'sourceRoot' | 'name'>) {
  const nameSinglularClassify = toSinglularClassify(name);
  const nameSinglularDasherize = toSinglularDasherize(name);

  const importsInput: ImportDeclaration[] = createImportsStatement(
    moduleImportsData(nameSinglularClassify, nameSinglularDasherize),
  );

  const providers = moduleProvidersData(nameSinglularClassify).join(', ');
  const controllers = [];

  return addFilesToTree(
    { name: nameSinglularClassify, imports: getImportsAsText(importsInput), providers, controllers },
    `${sourceRoot}`,
    ['__name@dasherize__.module.ts.template'],
    './files',
  );
}

function toSinglularClassify(name: string) {
  return pluralize.singular(strings.classify(name));
}
function toSinglularDasherize(name: string) {
  return pluralize.singular(strings.dasherize(name));
}
