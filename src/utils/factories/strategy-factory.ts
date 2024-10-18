import { MongooseFactorySet } from './mongoose-factory-set'; // Assume we have Mongoose Factory Set
import { IFactorySet } from './property-factory.interfaces';
import { SourceType } from './source-types.enum';

/**
 * A factory that creates and returns a set of Property Factories based on the source type.
 */
export class StrategyFactory {
  static createFactorySet(sourceType: SourceType): IFactorySet {
    switch (sourceType) {
      case SourceType.MongooseSchema:
        return new MongooseFactorySet(); // Return a set of factories for Mongoose
      // case SourceType.PostgresSchema:
      //   return new PostgresFactorySet(); // Return a set of factories for Postgres
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }
  }
}
