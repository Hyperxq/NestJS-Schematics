import { deepCopy, normalize } from '@angular-devkit/core';
import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { cyan } from 'ansi-colors';
import { parse } from 'json5';

import { AskForNotIndexesQuestion, ChooseSchemaQuestion } from '../builder-generate/resource/questions.terminal';
import { Properties, Schema, SchemaInfo, SchemaResult } from '../builder-generate/resource/resource.interfaces';
import { SchematicOptions } from '../builder-generate/resource/resource.schema';
import { colors } from './color';

let schemasCache: { path: string; schemaName: string; fileContent: string }[];

export async function loadAndParseSchema(
  { sourceRoot }: SchematicOptions,
  tree: Tree,
  _context: SchematicContext,
): Promise<SchemaResult | undefined> {
  const schemas = getSchemas(tree, sourceRoot!);

  if (schemas.length === 0) {
    console.log(colors.bold(colors.red('Schemas not found')));

    return;
  }

  const schema = await ChooseSchemaQuestion<{
    path: string;
    schemaName: string;
    fileContent: string;
  }>(schemas.map((schema) => ({ name: cyan(schema.schemaName), value: schema })));

  const { properties, schemaName, skipIndexes, path } = await getPropertiesFromSchema(schema);
  const { subSchemas, properties: propertiesUpdated } = await checkSubSchemas(
    path.replace('/files', ''),
    schemaName,
    properties,
    sourceRoot!,
    tree,
  );

  return {
    schema: {
      path: path.replace('/files', ''),
      name: schemaName.replace('Schema', '').toLowerCase(),
      properties: propertiesUpdated,
      skipIndexes,
    },
    subSchemas,
  };
}

function getSchemaFiles(tree: Tree, basePath: string) {
  const localSchemaFiles = (tree.getDir(`${basePath}/schemas`).subfiles as string[]) ?? [];
  const schemaFiles: { path: string; fileName: string }[] = [];
  if (localSchemaFiles.length > 0) {
    schemaFiles.push(...localSchemaFiles.map((fileName) => ({ path: basePath, fileName })));
  }
  const subFolders = tree.getDir(basePath).subdirs;
  subFolders.forEach((sf) => {
    schemaFiles.push(...getSchemaFiles(tree, normalize(`${basePath}/${sf as string}`)));
  });

  return schemaFiles;
}

async function getPropertiesFromSchema(schema: Schema, askIndexNotFound = true) {
  const { fileContent, schemaName, path } = schema;
  const properties: { [key: string]: { [key: string]: any } } = extractProperties(fileContent!, schema.schemaName);

  const indexes = extractIndexes(fileContent!, schemaName) ?? [];
  let skipIndexes = false;
  if (!indexes || indexes.length === 0) {
    if (askIndexNotFound) {
      console.log(colors.bold(colors.yellow('Indexes not found. Get dto uses indexes for its fields')));
      skipIndexes = await AskForNotIndexesQuestion();
    } else {
      skipIndexes = true;
    }
  }
  for (const index of indexes) {
    properties[index].isIndex = true;
  }

  return {
    path,
    schemaName: schema.schemaName,
    properties,
    skipIndexes,
  };
}

function identifySchemas(schemaText: string) {
  const schemaMatches = [...schemaText.matchAll(/\w+(?=\s*=\s*new\s*mongoose\.Schema)/gm)];

  return schemaMatches.map((match) => match[0]);
}

function extractProperties(schemaText: string, schemaName: string) {
  const pattern = new RegExp(
    `(?:${schemaName}\\.add\\(\\s*)([\\s\\S]+?)\\s*,*\\s*(?:'([\\S\\s]*?)'\\s*,*\\s*)*\\)`,
    'm',
  );

  const result = schemaText.match(pattern) ?? [];

  return result[1] ? parseObject(result[1]) : {};
}

function getSchemas(tree: Tree, sourceRoot: string) {
  if (schemasCache) {
    return schemasCache;
  }
  const schemaFiles = getSchemaFiles(tree, sourceRoot!);

  const schemas: { path: string; schemaName: string; fileContent: string }[] = [];
  for (const { path, fileName } of schemaFiles) {
    const filePath = `${path}/schemas/${fileName}`;
    const buffer = tree.read(filePath)!;
    const fileContent = buffer.toString('utf-8');
    schemas.push(
      ...identifySchemas(fileContent).map((schemaName) => ({
        path,
        schemaName,
        fileContent,
      })),
    );
  }
  schemasCache = schemas;

  return schemasCache;
}

async function checkSubSchemas(
  schemaPath: string,
  schemaName: string,
  properties: Properties,
  sourceRoot: string,
  tree: Tree,
): Promise<{ subSchemas: SchemaInfo[]; properties: Properties }> {
  try {
    const propertiesCloned = deepCopy(properties);
    const subSchemasProperties = getNotMongooseProperties(properties);

    if (subSchemasProperties.length === 0 || subSchemasProperties === undefined) {
      return {
        subSchemas: [],
        properties,
      };
    }

    const schemas = getSchemas(tree, sourceRoot!);

    const subSchemas: SchemaInfo[] = [];

    for (const [propertyName, content] of subSchemasProperties) {
      if (content.type === undefined) {
        throw new SchematicsException(`${propertyName} from ${schemaName} needs to have a type`);
      }
      const { type } = content;
      const schema = schemas.find((s) => s.schemaName === type);
      if (!schema) {
        throw new SchematicsException(
          `${propertyName} is was detected like a sub-schema but no schema was found with the name: ${type}`,
        );
      }
      // Removed the Schema type name with the named of the entity that we will create.
      propertiesCloned[propertyName].type = schema.schemaName.replace('Schema', '').toLowerCase();

      const { properties, schemaName: subSchemaName, skipIndexes, path } = await getPropertiesFromSchema(schema, false);

      // propertiesCloned[propertyName].importUrl = path;
      propertiesCloned[propertyName].importUrl = getRelativePath(schemaPath, schema.path);

      subSchemas.push({
        path,
        name: propertiesCloned[propertyName].type,
        properties,
        skipIndexes,
      });
    }

    return {
      subSchemas,
      properties: propertiesCloned,
    };
  } catch (e) {
    throw new SchematicsException(`Something happen when trying to check sub-schemas: ${e}`);
  }
}

function getRelativePath(from: string, to: string): string {
  // If both paths are the same, return './'
  if (from === to) {
    return './';
  }

  // Step 1: Split both strings into arrays
  const fromParts = from.split('/');
  const toParts = to.split('/');

  // Step 2: Determine the common path length using a for loop
  let commonLength = 0;
  for (; commonLength < fromParts.length && commonLength < toParts.length; commonLength++) {
    if (fromParts[commonLength] !== toParts[commonLength]) {
      break;
    }
  }

  const uniqueFromParts = fromParts.slice(commonLength);
  const uniqueToParts = toParts.slice(commonLength);

  // Step 3: Count the difference of folder between both
  const backSteps = uniqueToParts.length - 1; // subtract 1 as we don't count the file itself

  // Construct the relative path
  return backSteps === 0 ? './' : `${'../'.repeat(backSteps)}${uniqueFromParts.join('/')}`;
}

function getNotMongooseProperties(properties: Properties) {
  const primitiveTypes = [
    'String',
    'Number',
    'Date',
    'Buffer',
    'Boolean',
    'Array',
    'Decimal128',
    'Map',
    'UUID',
    'BigInt',
    'ObjectId',
    'Mixed',
  ];
  const entries = Object.entries(properties);

  return entries.filter(([key, content]) => primitiveTypes.find((pt) => pt === content.type) === undefined);
}

function parseObject(value: string): { [key: string]: any } {
  return parse(
    value
      .replace(/(\w+)\s*:\s*(\w+)/gm, '"$1": "$2"') // Quote keys and string values
      .replace(/(\w+):\s*\{/gm, '"$1": {')
      .replace(/"true"/g, 'true') // Revert quoting of true
      .replace(/"false"/g, 'false') // Revert quoting of false
      .replace(/[\n\s+]/gm, ''),
  );
}

function extractIndexes(schemaText: string, schemaName: string): string[] {
  const pattern = new RegExp(
    `(?:${schemaName}\\.index\\(\\s*)(\\{[\\s\\S]+?\\})\\s*,*\\s*(?:\\{[\\s\\S]+?\\}\\s*,*\\s*)*\\);`,
    'gm',
  );

  const result = [...(schemaText.matchAll(pattern) ?? [])];
  const indexArrayResult = result.map((str) => parseObject(str[1]));
  const indexes = indexArrayResult.reduce((acc, obj) => {
    Object.keys(obj).forEach((key) => {
      acc.push(key);
    });

    return acc;
  }, []) as string[];

  return Array.from(new Set(indexes));
}
