import { normalize } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree, chain } from '@angular-devkit/schematics';
import { addDeclarationToModule, addFilesToTree, getRelativePath, getSourceRoot } from '../../utils';
import { addShortImportToTsConfig } from '../../utils/AST';
import { OutputType } from '../../utils/enums/output-types.enum';
import { SourceType } from '../../utils/enums/source-types.enum';
import { MainFactory } from '../../utils/factories/main-factory';
import { ContentResult } from '../../utils/interfaces/property-factory.interfaces';
import { SchematicOptions } from './crud-graphql-mongo.schema';

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
  return async (tree: Tree) => {
    const relativePath = getRelativePath(process.cwd());
    if (relativePath === '/') {
      if (!options.sourceRoot) {
        options.sourceRoot = await getSourceRoot([]);
      }
    } else {
      options.sourceRoot = '/';
    }

    const rules: Rule[] = [];

    const factory = new MainFactory(SourceType.MongooseSchema, OutputType.GRAPHQL);
    await factory.loadData(options.sourceRoot, tree);

    rules.push(addCommonFiles({ sourceRoot: options.sourceRoot }));

    const getDTOs: ContentResult[] = factory.generateGetDTO();
    const createDTOs: ContentResult[] = factory.generateCreateDTO();
    const updateDTOs: ContentResult[] = factory.generateUpdateDTO();
    const entities: ContentResult[] = factory.generateEntity();
    const resolvers: ContentResult[] = factory.generateResolver();
    const services: ContentResult[] = factory.generateService();
    const modules: ContentResult[] = factory.generateModule();
    const repositories: ContentResult[] = factory.generateRepository();

    const sourceRoot = options.sourceRoot;

    resolvers.forEach((contentResult) => {
      rules.push(addResolver({ sourceRoot, contentResult }));
    });
    services.forEach((contentResult) => {
      rules.push(addService({ sourceRoot, contentResult }));
    });

    modules.forEach((contentResult) => {
      rules.push(addModule({ sourceRoot, contentResult }));
      rules.push(addDeclarationToModule({ name: contentResult.name, sourceRoot: contentResult.path }));
    });

    repositories.forEach((contentResult) => {
      rules.push(addRepository({ sourceRoot, contentResult }));
    });

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

function addRepository({
  sourceRoot,
  contentResult: { name, imports },
}: {
  sourceRoot: string;
  contentResult: ContentResult;
}) {
  // TODO: add the common configs files to the project.
  // * For now we can assume the we are using a single project.
  // TODO: check if the workspace is a single project or multiproject.

  return addFilesToTree(
    { name, imports },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.repository.ts.template'],
    './files',
  );
}

function addService({
  sourceRoot,
  contentResult: { name, imports },
}: {
  sourceRoot: string;
  contentResult: ContentResult;
}) {
  return addFilesToTree(
    { name, imports },
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

function addResolver({
  sourceRoot,
  contentResult: { name, imports },
}: {
  sourceRoot: string;
  contentResult: ContentResult;
}) {
  return addFilesToTree(
    { name, imports },
    `${sourceRoot}`,
    ['__name@singular@dasherize__.resolver.ts.template'],
    './files',
  );
}

function addModule({
  sourceRoot,
  contentResult: { name, imports, content },
}: {
  sourceRoot: string;
  contentResult: ContentResult;
}) {
  return addFilesToTree(
    { name, imports, content },
    `${sourceRoot}`,
    ['__name@dasherize__.module.ts.template'],
    './files',
  );
}
