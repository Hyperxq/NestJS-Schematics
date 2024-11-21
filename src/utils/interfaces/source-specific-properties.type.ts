import { SourceType } from '../enums/source-types.enum';
import { MongooseSchemaDefinition } from './mongoose-schema.interfaces';

export type SourceSpecificProperties = {
  [SourceType.MongooseSchema]: MongooseSchemaDefinition; // For Mongoose schemas
  [SourceType.PostgresSchema]: Record<string, any>; // For Postgres entities
  [SourceType.JSON]: Record<string, any>; // For JSON input
};
