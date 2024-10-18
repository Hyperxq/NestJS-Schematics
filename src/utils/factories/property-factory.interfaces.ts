// factories/IPropertyFactory.ts

import { MongooseSchemaDefinition } from '../interfaces/mongoose-schema.interfaces';

/**
 * The shared interface that all property factories (e.g., GetDTO, CreateDTO, Entity) will implement.
 */
export interface IPropertyFactory {
  /**
   * Generates the content (e.g., DTO, Entity) based on the provided properties.
   * @param properties - The properties to generate content from.
   * @returns A string representing the generated content (e.g., TypeScript class definition).
   */
  generate(properties: Record<string, any>): string;
}

export interface IFactory {
  generate(properties: MongooseSchemaDefinition): string;
}

export interface IFactorySet {
  getEntityFactory(): IFactory;
  getCreateDTOFactory(): IFactory;
  getUpdateDTOFactory(): IFactory;
  getGetDTOFactory(): IFactory;
  getSchemaFactory(): IFactory;
}
