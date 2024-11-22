import { AgnosticFieldType } from '../../enums/agnostic-types.enum';
import { getRelevantFields, mapGraphQLType, mapType } from '../../field-utils-graphql';
import { generateImports } from '../../import-utils-graphql';
import { FieldMetadata, SchemaMetadata } from '../../interfaces/agnostic-data.interfaces';
import { ContentResult, IPropertyFactory } from '../../interfaces/property-factory.interfaces';

export class GetDTOFactory implements IPropertyFactory {
  generate(schemaMetadata: SchemaMetadata[]): ContentResult[] {
    return schemaMetadata.map(({ fields, name, path, skipIndexes }) => {
      const relevantFields = getRelevantFields(fields, skipIndexes);
      const imports = generateImports(relevantFields);
      const content = this.generateFields(relevantFields);

      return {
        name,
        path,
        content,
        imports,
      };
    });
  }

  private generateFields(fields: FieldMetadata[]): string {
    return fields
      .filter((x) => x.isIndexed)
      .map((field) => {
        const decorators = this.generateFieldDecorators(field);

        return `${decorators}\n  ${field.name}: ${mapType(field.type)};`;
      })
      .join('\n\n  ');
  }

  private generateFieldDecorators(field: FieldMetadata): string {
    const decorators = [];
    decorators.push(`@Field(() => ${mapGraphQLType(field.type)}, { nullable: false })`);

    if (field.validations?.min !== undefined) {
      decorators.push(`@Min(${field.validations.min})`);
    }
    if (field.validations?.max !== undefined) {
      decorators.push(`@Max(${field.validations.max})`);
    }
    if (field.validations?.min !== undefined) {
      decorators.push(`@MinLength(${field.validations.min})`);
    }
    if (field.validations?.max !== undefined) {
      decorators.push(`@MaxLength(${field.validations.max})`);
    }
    if (field.type === AgnosticFieldType.STRING) {
      decorators.push(`@IsString()`);
    }
    if (field.type === AgnosticFieldType.NUMBER) {
      decorators.push(`@IsInt()`);
    }
    if (field.type === AgnosticFieldType.BOOLEAN) {
      decorators.push(`@IsBoolean()`);
    }
    if (field.type === AgnosticFieldType.DATE) {
      decorators.push(`@IsDate()`);
    }

    return decorators.join('\n  ');
  }
}
