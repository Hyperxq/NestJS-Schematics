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

export interface BaseImport {
  importUrl: string; // The path to the module being imported
  importName: string[]; // The name of the imported class or function
  importType: 'default' | 'named'; // Whether it's a named or default export
}

// import home from './';
// import { myVar, myVar2 } from './';
// import * as Home from './';

interface ServiceImport extends BaseImport {
  forInjection: boolean; // Specifies if this import is for dependency injection
  injectedVariableName?: string; // Optional: name of the injected variable
}

interface DTOImport extends BaseImport {
  properties: string[]; // List of properties in the DTO
}

type NestFileImport = BaseImport | ServiceImport | DTOImport;

interface NestFileTemplateContext {
  dependencies: NestFileImport[]; // An array of imports for the file
  // Other properties like file-specific logic can be added here
}

interface ServiceData {
  // * repository: import url, importName, importType
  // * entity:  import url, importName, importType
  // * dtos: {
  // *  Create.input.dto:  import url, importName, importType
  // *  Get.input.dto:  import url, importName, importType
  // *  update.input.dto:  import url, importName, importType
  // * }
}

interface ResolverData {
  // * entity: import url, importName, importType
  // * service:  import url, importName, importType
  // * dtos: {
  // *  Create.input.dto:  import url, importName, importType
  // *  Get.input.dto:  import url, importName, importType
  // *  update.input.dto:  import url, importName, importType
  // * }
}

interface RepositoryData {
  // * entity: import url, importName, importType
}

interface ModuleData {
  // * resolver: import url, importName, importType
  // * entity: import url, importName, importType
  // * service:  import url, importName, importType
  // * schema:  import url, importName, importType
  // * repository:  import url, importName, importType
}

interface EntityData {
  // * name: string
  // eslint-disable-next-line max-len
  // * properties: { Type: Int ( Max, Min) | String (IsUppercase | IsLowercase, IsString) | boolean | date, name: string, default: any,   }[]
}

interface CreateDTOData {
  // * name: string
  // eslint-disable-next-line max-len
  // * properties: { Type: Int ( Max, Min) | String (IsUppercase | IsLowercase, IsString) | boolean | date, name: string, default: any,   }[]
}
