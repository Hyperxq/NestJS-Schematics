import { normalize } from '@angular-devkit/core';
import { MergeStrategy, Rule, SchematicsException, Tree, branchAndMerge, chain } from '@angular-devkit/schematics';
import { addDeclarationToModule, addFilesToTree, getRelativePath, getSourceRoot } from '../../utils';
import { addShortImportToTsConfig } from '../../utils/AST';
import { OutputType } from '../../utils/enums/output-types.enum';
import { SourceType } from '../../utils/enums/source-types.enum';
import { MainFactory } from '../../utils/factories/main-factory';
import { ContentResult } from '../../utils/interfaces/property-factory.interfaces';
import { SchematicOptions } from './crud-graphql-mongo.schema';

export function crudGraphqlMongoFactory(options: SchematicOptions): Rule {
  return async (tree: Tree) => {
    const sourceRoot = await resolveSourceRoot(options);
    const factory = await initializeFactory(SourceType.MongooseSchema, OutputType.GRAPHQL, sourceRoot, tree);

    const rules = createRules(factory, sourceRoot);
    rules.push(addCommonFiles({ sourceRoot }));

    return branchAndMerge(chain(rules), MergeStrategy.Overwrite);
  };
}

// Resolves the source root based on the provided options and current directory
async function resolveSourceRoot(options: SchematicOptions): Promise<string> {
  if (!options.sourceRoot) {
    return getSourceRoot([]);
  }

  const relativePath = getRelativePath(process.cwd());

  return relativePath === '/' ? options.sourceRoot : '/';
}

// Initializes the MainFactory with the required data
async function initializeFactory(
  sourceType: SourceType,
  outputType: OutputType,
  sourceRoot: string,
  tree: Tree,
): Promise<MainFactory<SourceType>> {
  const factory = new MainFactory(sourceType, outputType);
  await factory.loadData(sourceRoot, tree);

  return factory;
}

// Dynamically generates rules based on the content generated by the factory
function createRules(factory: MainFactory<SourceType>, sourceRoot: string): Rule[] {
  const rules: Rule[] = [];

  const contentGroups = {
    resolvers: factory.generateResolver(),
    services: factory.generateService(),
    modules: factory.generateModule(),
    repositories: factory.generateRepository(),
    getDTOs: factory.generateGetDTO(),
    createDTOs: factory.generateCreateDTO(),
    updateDTOs: factory.generateUpdateDTO(),
    entities: factory.generateEntity(),
  };

  Object.entries(contentGroups).forEach(([key, contents]) => {
    contents.forEach((contentResult) => {
      const ruleGenerator = ruleMapping(contentResult)[key as keyof typeof ruleMapping];
      rules.push(ruleGenerator());
    });
  });

  return rules;
}

const ruleMapping = (contentResult: ContentResult): Record<string, () => Rule> => ({
  resolvers: () => addResolver({ contentResult }),
  services: () => addService({ contentResult }),
  modules: () =>
    chain([
      addModule({ contentResult }),
      addDeclarationToModule({ name: contentResult.name, sourceRoot: contentResult.path }),
    ]),
  repositories: () => addRepository({ contentResult }),
  getDTOs: () => addDTO(contentResult, 'GET'),
  createDTOs: () => addDTO(contentResult, 'CREATE'),
  updateDTOs: () => addDTO(contentResult, 'UPDATE'),
  entities: () => addEntity(contentResult),
});

// Adds common configuration files like tsconfig.json and reusable modules
function addCommonFiles({ sourceRoot }: Pick<SchematicOptions, 'sourceRoot'>): Rule {
  return (tree: Tree) => {
    const tsconfigPath = normalize('/tsconfig.json');
    if (!tree.exists(tsconfigPath)) {
      logAndThrow(`tsconfig.json not found at path: ${tsconfigPath}`);
    }

    let tsconfigContent = tree.readText(tsconfigPath);
    if (!tsconfigContent) {
      logAndThrow(`Failed to read tsconfig.json at path: ${tsconfigPath}`);
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

// Generalized function to create file rules
function createAddFileRule(
  { name, content, path, imports }: ContentResult,
  template: string,
  filesRoot = './files',
): Rule {
  return addFilesToTree({ name, content, imports }, `${path}`, [template], filesRoot);
}

// Adds entity files to the tree
function addEntity(contentResult: ContentResult): Rule {
  return createAddFileRule(contentResult, '__name@singular@dasherize@ent__.ts.template');
}

// Adds DTO files to the tree
function addDTO(contentResult: ContentResult, dtoType: 'GET' | 'CREATE' | 'UPDATE'): Rule {
  const templates = {
    GET: 'get-__name@singular@dasherize__.input.dto.ts.template',
    CREATE: 'create-__name@singular@dasherize__.input.dto.ts.template',
    UPDATE: 'update-__name@singular@dasherize__.input.dto.ts.template',
  };

  return createAddFileRule(contentResult, templates[dtoType]);
}

// Adds repository files to the tree
function addRepository({ contentResult }: { contentResult: ContentResult }): Rule {
  return createAddFileRule(contentResult, '__name@singular@dasherize__.repository.ts.template', './files');
}

// Adds service files to the tree
function addService({ contentResult }: { contentResult: ContentResult }): Rule {
  return createAddFileRule(contentResult, '__name@singular@dasherize__.service.ts.template', './files');
}

// Adds resolver files to the tree
function addResolver({ contentResult }: { contentResult: ContentResult }): Rule {
  return createAddFileRule(contentResult, '__name@singular@dasherize__.resolver.ts.template', './files');
}

// Adds module files to the tree
function addModule({ contentResult }: { contentResult: ContentResult }): Rule {
  return createAddFileRule(contentResult, '__name@dasherize__.module.ts.template', './files');
}

// Utility function for consistent error logging and throwing
function logAndThrow(message: string): never {
  console.error(message);
  throw new SchematicsException(message);
}
