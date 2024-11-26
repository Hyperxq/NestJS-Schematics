import { deepCopy, normalize } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { cyan } from 'ansi-colors';
import { AskForNotIndexesQuestion, ChooseSchemaQuestion } from '../../builder-generate/resource/questions.terminal';
import { Properties, Schema, SchemaInfo } from '../../builder-generate/resource/resource.interfaces';
import { parseMongooseSchemaFromContent } from '../AST';
import { colors } from '../color';
import { Loader } from '../interfaces/loader.interface';
import { getRelativePath } from '../path';

export class MongooseLoader implements Loader<SchemaInfo> {
  schemasCache: Readonly<{ path: string; schemaName: string; fileContent: string }[]> = [];

  async getData(tree: Tree, sourceRoot: string) {
    const schemas = this.getSchemas(tree, sourceRoot!);

    if (schemas.length === 0) {
      console.log(colors.bold(colors.red(`We didn't find any schema`)));

      process.exit();
    }

    const schema = await ChooseSchemaQuestion<{
      path: string;
      schemaName: string;
      fileContent: string;
    }>(schemas.map((schema) => ({ name: cyan(schema.schemaName), value: schema })));

    const { properties, schemaName, skipIndexes, path } = await this.getPropertiesFromSchema(schema);

    const { subSchemas, properties: propertiesUpdated } = await this.checkSubSchemas(
      path.replace('/files', ''),
      schemaName,
      properties,
      sourceRoot!,
      tree,
    );

    return [
      {
        path: path.replace('/files', ''),
        name: schemaName.replace('Schema', '').toLowerCase(),
        fileContent: schema.fileContent,
        mainSchema: true,
        properties: propertiesUpdated,
        skipIndexes,
      },
    ];
  }

  getSchemas(tree: Tree, sourceRoot: string) {
    if (this.schemasCache) {
      return this.schemasCache;
    }
    const schemaFiles = this.getSchemaFiles(tree, sourceRoot!);

    const schemas: { path: string; schemaName: string; fileContent: string }[] = [];
    for (const { path, fileName } of schemaFiles) {
      const filePath = `${path}/schemas/${fileName}`;
      const buffer = tree.read(filePath)!;
      const fileContent = buffer.toString('utf-8');
      schemas.push(
        ...this.identifySchemas(fileContent).map((schemaName) => ({
          path,
          schemaName,
          fileContent,
        })),
      );
    }
    this.schemasCache = schemas;

    return this.schemasCache;
  }

  getSchemaFiles(tree: Tree, basePath: string) {
    const localSchemaFiles = (tree.getDir(`${basePath}/schemas`).subfiles as string[]) ?? [];
    const schemaFiles: { path: string; fileName: string }[] = [];
    if (localSchemaFiles.length > 0) {
      schemaFiles.push(...localSchemaFiles.map((fileName) => ({ path: basePath, fileName })));
    }
    const subFolders = tree.getDir(basePath).subdirs;
    subFolders.forEach((sf) => {
      schemaFiles.push(...this.getSchemaFiles(tree, normalize(`${basePath}/${sf as string}`)));
    });

    return schemaFiles;
  }

  identifySchemas(schemaText: string) {
    const schemaMatches = [...schemaText.matchAll(/\w+(?=\s*=\s*new\s*mongoose\.Schema)/gm)];

    return schemaMatches.map((match) => match[0]);
  }

  async getPropertiesFromSchema(schema: Schema, askIndexNotFound = true) {
    const { fileContent, schemaName, path } = schema;
    const { properties, indexes } = parseMongooseSchemaFromContent(fileContent);

    let useAllFieldsAsKeys = false;
    if (!indexes || indexes.length === 0) {
      if (askIndexNotFound) {
        console.log(colors.bold(colors.yellow('Indexes not found. Get dto uses indexes for its fields')));
        useAllFieldsAsKeys = await AskForNotIndexesQuestion();
      } else {
        useAllFieldsAsKeys = true;
      }
    }

    let keys = indexes;

    if (useAllFieldsAsKeys) {
      keys = Object.keys(properties);
    }

    for (const key of keys) {
      properties[key].isIndex = true;
    }

    return {
      path,
      schemaName,
      properties,
      skipIndexes: useAllFieldsAsKeys,
    };
  }

  async checkSubSchemas(
    schemaPath: string,
    schemaName: string,
    properties: Properties,
    sourceRoot: string,
    tree: Tree,
  ): Promise<{ subSchemas: SchemaInfo[]; properties: Properties }> {
    try {
      const propertiesCloned = deepCopy(properties);
      const subSchemasProperties = this.getNotMongooseProperties(properties);

      if (subSchemasProperties.length === 0 || subSchemasProperties === undefined) {
        return {
          subSchemas: [],
          properties,
        };
      }

      const schemas = this.getSchemas(tree, sourceRoot!);

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

        const { properties, skipIndexes, path } = await this.getPropertiesFromSchema(schema, false);

        propertiesCloned[propertyName].importUrl = getRelativePath(schemaPath);

        subSchemas.push({
          path,
          name: propertiesCloned[propertyName].type,
          fileContent: schema.fileContent,
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

  getNotMongooseProperties(properties: Properties) {
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
}
