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
  properties: { [key: string]: any };
  skipIndexes: boolean;
}

export interface Properties {
  [key: string]: any;
}
