import { SchemaMetadata } from './agnostic-data.interfaces';
import { SourceSpecificProperties } from './source-specific-properties.type';

export interface Intermediate<Input = SourceSpecificProperties, Response = SchemaMetadata> {
  parseData: (data: Input | Input[]) => Response;
}
