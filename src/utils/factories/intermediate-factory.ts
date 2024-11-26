import { MongooseIntermediate } from '../IntermediateMetadata';
import { SourceType } from '../enums/source-types.enum';
import { Intermediate, SchemaMetadata, SourceSpecificProperties } from '../interfaces';

/**
 * A factory that creates and returns a set of Intermediate factories based on the source type.
 */
export class IntermediateFactory {
  static createFactory<T extends SourceType>(
    inputType: SourceType,
  ): Intermediate<SourceSpecificProperties[T], SchemaMetadata[]> {
    switch (inputType) {
      case SourceType.MongooseSchema:
        return new MongooseIntermediate();
      default:
        throw new Error(`Unsupported source type: ${inputType}`);
    }
  }
}
