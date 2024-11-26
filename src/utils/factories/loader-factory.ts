import { MongooseIntermediate } from '../IntermediateMetadata/mongoose.intermediate';
import { MongooseLoader } from '../Loaders';
import { SourceType } from '../enums/source-types.enum';
import { SchemaMetadata } from '../interfaces/agnostic-data.interfaces';
import { Intermediate } from '../interfaces/intermediate.interface';
import { Loader } from '../interfaces/loader.interface';
import { SourceSpecificProperties } from '../interfaces/source-specific-properties.type';

/**
 * A factory that creates and returns a set of Intermediate factories based on the source type.
 */
export class LoaderFactory {
  static createFactory<T extends SourceType>(inputType: SourceType): Loader<SourceSpecificProperties[T]> {
    switch (inputType) {
      case SourceType.MongooseSchema:
        return new MongooseLoader();
      default:
        throw new Error(`Unsupported source type: ${inputType}`);
    }
  }
}
