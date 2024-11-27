import { Tree } from '@angular-devkit/schematics';
import { OutputType } from '../enums/output-types.enum';
import { SourceType } from '../enums/source-types.enum';
import { SchemaMetadata } from '../interfaces/agnostic-data.interfaces';
import { Intermediate } from '../interfaces/intermediate.interface';
import { Loader } from '../interfaces/loader.interface';
import { ContentResult, IFactorySet } from '../interfaces/property-factory.interfaces';
import { SourceSpecificProperties } from '../interfaces/source-specific-properties.type';
import { IntermediateFactory } from './intermediate-factory';
import { LoaderFactory } from './loader-factory';
import { OutputSetFactory } from './output-set-factory';

/**
 * The main factory that initializes and manages the property factories (e.g., GetDTO, CreateDTO, Entity, UpdateDTO, Schema).
 */
export class MainFactory<T extends SourceType> {
  private sourceType: SourceType;
  private outputType: OutputType;
  private factorySet: IFactorySet;
  private intermediate: Intermediate<SourceSpecificProperties[T], SchemaMetadata[]>;
  private elements: SchemaMetadata[];
  private loader: Loader<SourceSpecificProperties[T]>;

  constructor(sourceType: SourceType, outputType: OutputType) {
    this.sourceType = sourceType;
    this.outputType = outputType;
    this.factorySet = OutputSetFactory.createFactorySet(this.outputType);
    this.loader = LoaderFactory.createFactory(this.sourceType);
    this.intermediate = IntermediateFactory.createFactory(this.sourceType);
  }

  async loadData(sourceRoot: string, tree: Tree) {
    const properties = this.loader.getData(tree, sourceRoot);
    this.elements = this.intermediate.parseData(await properties);
  }

  /**
   * Generates a GetDTO using the GetDTOFactory.
   * @param properties - The properties to generate the GetDTO from.
   * @returns A ContentResult[] representing the generated GetDTO.
   */
  generateGetDTO(): ContentResult[] {
    return this.factorySet.getGetDTOFactory().generate(this.elements);
  }

  /**
   * Generates a CreateDTO using the CreateDTOFactory.
   * @param properties - The properties to generate the CreateDTO from.
   * @returns A string representing the generated CreateDTO.
   */
  generateCreateDTO(): ContentResult[] {
    return this.factorySet.getCreateDTOFactory().generate(this.elements);
  }

  /**
   * Generates an UpdateDTO using the UpdateDTOFactory.
   * @param properties - The properties to generate the UpdateDTO from.
   * @returns A string representing the generated UpdateDTO.
   */
  generateUpdateDTO(): ContentResult[] {
    return this.factorySet.getUpdateDTOFactory().generate(this.elements);
  }

  /**
   * Generates a Schema using the SchemaFactory.
   * @param properties - The properties to generate the Schema from.
   * @returns A string representing the generated Schema.
   */
  generateSchema(): ContentResult[] {
    return this.factorySet.getSchemaFactory().generate(this.elements);
  }

  /**
   * Generates an Entity using the EntityFactory.
   * @param properties - The properties to generate the Entity from.
   * @returns A string representing the generated Entity.
   */
  generateEntity(): ContentResult[] {
    return this.factorySet.getEntityFactory().generate(this.elements);
  }

  generateResolver(): ContentResult[] {
    return this.factorySet.resolverFactory().generate(this.elements);
  }

  generateService(): ContentResult[] {
    return this.factorySet.serviceFactory().generate(this.elements);
  }

  generateRepository(): ContentResult[] {
    return this.factorySet.repositoryFactory().generate(this.elements);
  }

  generateModule(): ContentResult[] {
    return this.factorySet.moduleFactory().generate(this.elements);
  }
}
