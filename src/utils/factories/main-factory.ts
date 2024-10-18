import { MongooseSchemaDefinition } from '../interfaces/mongoose-schema.interfaces';
import { IFactorySet } from './property-factory.interfaces';
import { SourceType } from './source-types.enum';
import { StrategyFactory } from './strategy-factory';

/**
 * The main factory that initializes and manages the property factories (e.g., GetDTO, CreateDTO, Entity, UpdateDTO, Schema).
 */
export class MainFactory {
  private factorySet: IFactorySet;

  constructor(sourceType: SourceType) {
    // Use the StrategyFactory to initialize the set of factories based on the source type.
    this.factorySet = StrategyFactory.createFactorySet(sourceType);
  }

  /**
   * Generates a GetDTO using the GetDTOFactory.
   * @param properties - The properties to generate the GetDTO from.
   * @returns A string representing the generated GetDTO.
   */
  generateGetDTO(properties: MongooseSchemaDefinition): string {
    return this.factorySet.getGetDTOFactory().generate(properties);
  }

  /**
   * Generates a CreateDTO using the CreateDTOFactory.
   * @param properties - The properties to generate the CreateDTO from.
   * @returns A string representing the generated CreateDTO.
   */
  generateCreateDTO(properties: MongooseSchemaDefinition): string {
    return this.factorySet.getCreateDTOFactory().generate(properties);
  }

  /**
   * Generates an UpdateDTO using the UpdateDTOFactory.
   * @param properties - The properties to generate the UpdateDTO from.
   * @returns A string representing the generated UpdateDTO.
   */
  generateUpdateDTO(properties: MongooseSchemaDefinition): string {
    return this.factorySet.getUpdateDTOFactory().generate(properties);
  }

  /**
   * Generates a Schema using the SchemaFactory.
   * @param properties - The properties to generate the Schema from.
   * @returns A string representing the generated Schema.
   */
  generateSchema(properties: MongooseSchemaDefinition): string {
    return this.factorySet.getSchemaFactory().generate(properties);
  }

  /**
   * Generates an Entity using the EntityFactory.
   * @param properties - The properties to generate the Entity from.
   * @returns A string representing the generated Entity.
   */
  generateEntity(properties: MongooseSchemaDefinition): string {
    return this.factorySet.getEntityFactory().generate(properties);
  }
}
