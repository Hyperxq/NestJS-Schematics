import { AgnosticFieldType } from './enums/agnostic-types.enum';
import { FieldMetadata } from './interfaces/agnostic-data.interfaces';

/**
 * Generates imports for a class or DTO and combines imports from the same library.
 */
export function generateImports(fields: FieldMetadata[], forGraphQL = true, isInput = true): string {
  const importMap = new Map<string, Set<string>>();

  const addImport = (library: string, specifier: string) => {
    if (!importMap.has(library)) {
      importMap.set(library, new Set());
    }
    importMap.get(library)?.add(specifier);
  };

  if (forGraphQL) {
    addImport('@nestjs/graphql', 'Field');
    addImport('@nestjs/graphql', isInput ? 'InputType' : 'ObjectType');
  }

  if (fields.some((field) => field.validations?.min !== undefined)) {
    addImport('class-validator', 'Min');
  }
  if (fields.some((field) => field.validations?.max !== undefined)) {
    addImport('class-validator', 'Max');
  }
  if (fields.some((field) => field.validations?.min !== undefined)) {
    addImport('class-validator', 'MinLength');
  }
  if (fields.some((field) => field.validations?.max !== undefined)) {
    addImport('class-validator', 'MaxLength');
  }
  if (fields.some((field) => field.type === AgnosticFieldType.STRING)) {
    addImport('class-validator', 'IsString');
  }
  if (fields.some((field) => field.type === AgnosticFieldType.NUMBER)) {
    addImport('@nestjs/graphql', 'Int');
    addImport('class-validator', 'IsInt');
  }
  if (fields.some((field) => field.type === AgnosticFieldType.BOOLEAN)) {
    addImport('class-validator', 'IsBoolean');
  }
  if (fields.some((field) => field.type === AgnosticFieldType.DATE)) {
    addImport('class-validator', 'IsDate');
    addImport('graphql-scalars', 'GraphQLDateTime');
  }

  if (fields.some((field) => field.type === AgnosticFieldType.OBJECT_ID)) {
    addImport('graphql-scalars', 'GraphQLObjectID');
  }

  return Array.from(importMap.entries())
    .map(([library, specifiers]) => `import { ${Array.from(specifiers).join(', ')} } from '${library}';`)
    .join('\n');
}
