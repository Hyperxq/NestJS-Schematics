import { MongooseSchemaDefinition } from '../../utils/interfaces/mongoose-schema.interfaces';

export interface SchemaResult {
  schema: SchemaInfo;
  subSchemas: SchemaInfo[];
}

export interface Schema {
  path: string;
  schemaName: string;
  fileContent: string;
}

export interface SchemaInfo {
  path: string;
  name: string;
  properties: MongooseSchemaDefinition;
  skipIndexes: boolean;
  fileContent: string;
  mainSchema?: boolean;
}

export interface Properties {
  [key: string]: any;
}
