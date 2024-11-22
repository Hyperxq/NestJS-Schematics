import { SchemaInfo } from '../../builder-generate/resource/resource.interfaces';
import { SourceType } from '../enums/source-types.enum';

export type SourceSpecificProperties = {
  [SourceType.MongooseSchema]: SchemaInfo[]; // For Mongoose schemas
  [SourceType.PostgresSchema]: Record<string, any>; // For Postgres entities
  [SourceType.JSON]: Record<string, any>; // For JSON input
};
