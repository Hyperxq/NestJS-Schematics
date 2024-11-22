import { AgnosticFieldType } from './enums/agnostic-types.enum';
import { FieldMetadata } from './interfaces/agnostic-data.interfaces';

/**
 * Maps the agnostic field type to a TypeScript type.
 */
export function mapType(type: AgnosticFieldType): string {
  const typeMapping: Record<AgnosticFieldType, string> = {
    [AgnosticFieldType.STRING]: 'string',
    [AgnosticFieldType.NUMBER]: 'number',
    [AgnosticFieldType.BOOLEAN]: 'boolean',
    [AgnosticFieldType.DATE]: 'Date',
    [AgnosticFieldType.OBJECT_ID]: 'string',
    [AgnosticFieldType.ARRAY]: 'any[]',
    [AgnosticFieldType.MAP]: 'Map<any, any>',
    [AgnosticFieldType.UNKNOWN]: 'any',
  };

  return typeMapping[type] ?? 'any';
}

/**
 * Maps the agnostic field type to a GraphQL-compatible type.
 */
export function mapGraphQLType(type: AgnosticFieldType): string {
  const typeMapping: Record<AgnosticFieldType, string> = {
    [AgnosticFieldType.STRING]: 'String',
    [AgnosticFieldType.NUMBER]: 'Int',
    [AgnosticFieldType.BOOLEAN]: 'Boolean',
    [AgnosticFieldType.DATE]: 'GraphQLDateTime',
    [AgnosticFieldType.OBJECT_ID]: 'GraphQLObjectID',
    [AgnosticFieldType.ARRAY]: '[String]',
    [AgnosticFieldType.MAP]: 'JSON',
    [AgnosticFieldType.UNKNOWN]: 'String',
  };

  return typeMapping[type] ?? 'String';
}

/**
 * Filters fields to include either only indexed fields or all fields based on a condition.
 */
export function getRelevantFields(fields: FieldMetadata[], skipIndexes: boolean): FieldMetadata[] {
  const hasIndexes = fields.some((field) => field.isIndexed);
  if (!hasIndexes || skipIndexes) {
    return fields;
  }

  return fields.filter((field) => field.isIndexed);
}
