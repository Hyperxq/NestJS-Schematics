import { ContentResult, IPropertyFactory, SchemaMetadata } from '../interfaces';

export class PlaceHolderFactory implements IPropertyFactory {
  generate(properties: SchemaMetadata[]): ContentResult[] {
    throw new Error('Method not implemented.');
  }
}
