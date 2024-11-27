// factories/IPropertyFactory.ts

import { SchemaMetadata } from './agnostic-data.interfaces';

export interface ContentResult {
  name: string;
  path: string;
  content: string;
  imports: string;
}

/**
 * The shared interface that all property factories (e.g., GetDTO, CreateDTO, Entity) will implement.
 */
export interface IPropertyFactory {
  /**
   * Generates the content (e.g., DTO, Entity) based on the provided properties.
   * @param properties - The properties to generate content from.
   * @returns A string representing the generated content (e.g., TypeScript class definition).
   */
  generate(properties: SchemaMetadata[]): ContentResult[];
}

export interface IFactory {
  generate(properties: SchemaMetadata[]): ContentResult[];
}

export interface IFactorySet {
  getEntityFactory(): IFactory;
  getCreateDTOFactory(): IFactory;
  getUpdateDTOFactory(): IFactory;
  getGetDTOFactory(): IFactory;
  getSchemaFactory(): IFactory;
  repositoryFactory(): IFactory;
  serviceFactory(): IFactory;
  resolverFactory(): IFactory;
  moduleFactory(): IFactory;
}
