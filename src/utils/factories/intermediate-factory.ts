import { MongooseIntermediate } from '../IntermediateMetadata/mongoose.intermediate';
import { SourceType } from '../enums/source-types.enum';
import { SchemaMetadata } from '../interfaces/agnostic-data.interfaces';
import { Intermediate } from '../interfaces/intermediate.interface';
import { MongooseSchemaDefinition } from '../interfaces/mongoose-schema.interfaces';
import { SourceSpecificProperties } from '../interfaces/source-specific-properties.type';

/**
 * A factory that creates and returns a set of Intermediate factories based on the source type.
 */
export class IntermediateFactory {
  static createFactory<T extends SourceType>(
    inputType: SourceType,
  ): Intermediate<SourceSpecificProperties[T], SchemaMetadata> {
    switch (inputType) {
      case SourceType.MongooseSchema:
        return new MongooseIntermediate();
      default:
        throw new Error(`Unsupported source type: ${inputType}`);
    }
  }
}