import { deepCopy, normalize } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { cyan } from 'ansi-colors';
import mongoose from 'mongoose';
import { AskForNotIndexesQuestion, ChooseSchemaQuestion } from '../../builder-generate/resource/questions.terminal';
import { Properties, Schema, SchemaInfo } from '../../builder-generate/resource/resource.interfaces';
import { parseMongooseSchemaFromContent } from '../AST';
import { colors } from '../color';
import { identifySchemasUsingAst } from '../get-mongoose-schema-names';
import { Loader } from '../interfaces/loader.interface';
import { getRelativePath } from '../path';

export class MongooseLoader implements Loader<SchemaInfo[]> {
  private schemasCache?: ReadonlyArray<{ path: string; schemaName: string; fileContent: string }>;

  async getData(tree: Tree, sourceRoot: string): Promise<SchemaInfo[]> {
    const schemas = this.getSchemas(tree, sourceRoot);

    if (schemas.length === 0) {
      throw new SchematicsException('No schemas were found.');
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
      sourceRoot,
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
      ...subSchemas,
    ];
  }

  getSchemas(tree: Tree, sourceRoot: string): ReadonlyArray<{ path: string; schemaName: string; fileContent: string }> {
    if (!this.schemasCache) {
      this.schemasCache = this.loadSchemas(tree, sourceRoot);
    }

    return this.schemasCache;
  }

  private loadSchemas(
    tree: Tree,
    sourceRoot: string,
  ): ReadonlyArray<{ path: string; schemaName: string; fileContent: string }> {
    const schemaFiles = this.traverseDirectories(tree, sourceRoot);

    return schemaFiles.flatMap(({ path, fileName }) => {
      const filePath = `${path}/schemas/${fileName}`;
      const buffer = tree.read(filePath);

      if (!buffer) {
        throw new SchematicsException(`File not found: ${filePath}`);
      }

      const fileContent = buffer.toString('utf-8');

      return identifySchemasUsingAst(fileContent).map((schemaName) => ({
        path,
        schemaName,
        fileContent,
      }));
    });
  }

  private traverseDirectories(
    tree: Tree,
    basePath: string,
  ): {
    path: string;
    fileName: string;
  }[] {
    const localSchemaFiles = (tree.getDir(`${basePath}/schemas`).subfiles as string[]) ?? [];
    const schemaFiles: { path: string; fileName: string }[] = [];
    if (localSchemaFiles.length > 0) {
      schemaFiles.push(...localSchemaFiles.map((fileName) => ({ path: basePath, fileName })));
    }
    const subFolders = tree.getDir(basePath).subdirs;
    subFolders.forEach((sf) => {
      schemaFiles.push(...this.traverseDirectories(tree, normalize(`${basePath}/${sf as string}`)));
    });

    return schemaFiles;
  }

  private async getPropertiesFromSchema(
    schema: Schema,
    askIndexNotFound = true,
  ): Promise<{
    path: string;
    schemaName: string;
    properties: Properties;
    skipIndexes: boolean;
  }> {
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

    const keys = useAllFieldsAsKeys ? Object.keys(properties) : indexes;
    keys.forEach((key) => {
      properties[key].isIndex = true;
    });

    return {
      path,
      schemaName,
      properties,
      skipIndexes: useAllFieldsAsKeys,
    };
  }

  private async checkSubSchemas(
    schemaPath: string,
    schemaName: string,
    properties: Properties,
    sourceRoot: string,
    tree: Tree,
  ): Promise<{ subSchemas: SchemaInfo[]; properties: Properties }> {
    const propertiesCloned = deepCopy(properties);
    const subSchemasProperties = this.getNonPrimitiveProperties(properties);

    if (subSchemasProperties.length === 0) {
      return {
        subSchemas: [],
        properties,
      };
    }

    const schemas = this.getSchemas(tree, sourceRoot);
    const subSchemas: SchemaInfo[] = [];

    for (const [propertyName, content] of subSchemasProperties) {
      if (!content.type) {
        throw new SchematicsException(`${propertyName} from ${schemaName} must have a type`);
      }

      const schema = schemas.find((s) => s.schemaName === content.type);
      if (!schema) {
        throw new SchematicsException(
          `${propertyName} was detected as a sub-schema but no schema was found with the name: ${content.type}`,
        );
      }

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
  }

  private getNonPrimitiveProperties(properties: Properties): [string, any][] {
    const primitiveTypes = Object.keys(mongoose.Schema.Types);

    return Object.entries(properties).filter(([_, content]) => !primitiveTypes.includes(content.type));
  }
}
