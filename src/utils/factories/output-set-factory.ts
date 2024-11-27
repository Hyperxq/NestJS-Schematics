import { OutputType } from '../enums/output-types.enum';
import { IFactorySet } from '../interfaces/property-factory.interfaces';
import { GraphQLMongoFactorySet } from './graphql-mongo-factory-set'; // Assume we have Mongoose Factory Set

/**
 * A factory that creates and returns a set of Property Factories based on the source type.
 */
export class OutputSetFactory {
  static createFactorySet(outputType: OutputType): IFactorySet {
    switch (outputType) {
      case OutputType.GRAPHQL:
        return new GraphQLMongoFactorySet(); // Return a set of factories for Mongoose
      // case SourceType.PostgresSchema:
      //   return new PostgresFactorySet(); // Return a set of factories for Postgres
      default:
        throw new Error(`Unsupported output type: ${outputType}`);
    }
  }
}
