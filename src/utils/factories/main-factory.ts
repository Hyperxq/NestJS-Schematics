import { OutputType } from '../enums/output-types.enum';
import { SourceType } from '../enums/source-types.enum';
import { SchemaMetadata } from '../interfaces/agnostic-data.interfaces';
import { Intermediate } from '../interfaces/intermediate.interface';
import { MongooseSchemaDefinition } from '../interfaces/mongoose-schema.interfaces';
import { IFactorySet } from '../interfaces/property-factory.interfaces';
import { SourceSpecificProperties } from '../interfaces/source-specific-properties.type';
import { IntermediateFactory } from './intermediate-factory';
import { OutputSetFactory } from './output-set-factory';

/**
 * The main factory that initializes and manages the property factories (e.g., GetDTO, CreateDTO, Entity, UpdateDTO, Schema).
 */
export class MainFactory<T extends SourceType> {
  private sourceType: SourceType;
  private outputType: OutputType;
  private factorySet: IFactorySet;
  private intermediate: Intermediate<SourceSpecificProperties[T], SchemaMetadata>;
  private properties: SchemaMetadata;

  constructor(sourceType: SourceType, outputType: OutputType, properties: SourceSpecificProperties[T]) {
    this.sourceType = sourceType;
    this.outputType = outputType;
    this.factorySet = OutputSetFactory.createFactorySet(this.outputType);
    this.intermediate = IntermediateFactory.createFactory(this.sourceType);
    this.properties = this.intermediate.parseData(properties);
  }

  /**
   * Generates a GetDTO using the GetDTOFactory.
   * @param properties - The properties to generate the GetDTO from.
   * @returns A string representing the generated GetDTO.
   */
  generateGetDTO(): string {
    return this.factorySet.getGetDTOFactory().generate(this.properties);
  }

  /**
   * Generates a CreateDTO using the CreateDTOFactory.
   * @param properties - The properties to generate the CreateDTO from.
   * @returns A string representing the generated CreateDTO.
   */
  generateCreateDTO(): string {
    return this.factorySet.getCreateDTOFactory().generate(this.properties);
  }

  /**
   * Generates an UpdateDTO using the UpdateDTOFactory.
   * @param properties - The properties to generate the UpdateDTO from.
   * @returns A string representing the generated UpdateDTO.
   */
  generateUpdateDTO(): string {
    return this.factorySet.getUpdateDTOFactory().generate(this.properties);
  }

  /**
   * Generates a Schema using the SchemaFactory.
   * @param properties - The properties to generate the Schema from.
   * @returns A string representing the generated Schema.
   */
  generateSchema(): string {
    return this.factorySet.getSchemaFactory().generate(this.properties);
  }

  /**
   * Generates an Entity using the EntityFactory.
   * @param properties - The properties to generate the Entity from.
   * @returns A string representing the generated Entity.
   */
  generateEntity(): string {
    return this.factorySet.getEntityFactory().generate(this.properties);
  }
}
