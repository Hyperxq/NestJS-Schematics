import { AgnosticFieldType } from '../../enums/agnostic-types.enum';
import { mapGraphQLType, mapType } from '../../field-utils-graphql';
import { generateImports } from '../../import-utils-graphql';
import { FieldMetadata, SchemaMetadata } from '../../interfaces/agnostic-data.interfaces';
import { ContentResult, IPropertyFactory } from '../../interfaces/property-factory.interfaces';

export class UpdateDTOFactory implements IPropertyFactory {
  generate(schemaMetadata: SchemaMetadata[]): ContentResult[] {
    return schemaMetadata.map(({ fields, name, path }) => {
      const modifiedFields = this.makeFieldsOptional(fields);
      const imports = generateImports(modifiedFields);
      const content = this.generateFields(modifiedFields);

      return {
        name,
        path,
        content,
        imports,
      };
    });
  }

  /**
   * Ensures all fields are optional for update DTOs.
   */
  private makeFieldsOptional(fields: FieldMetadata[]): FieldMetadata[] {
    return fields.map((field) => ({
      ...field,
      isRequired: false, // Set all fields to optional
    }));
  }

  /**
   * Generates field definitions inside the class, including their decorators.
   */
  private generateFields(fields: FieldMetadata[]): string {
    return fields
      .map((field) => {
        const decorators = this.generateFieldDecorators(field);

        return `${decorators}\n  ${field.name}: ${mapType(field.type)};`;
      })
      .join('\n\n  ');
  }

  /**
   * Generates the decorators for a single field.
   */
  private generateFieldDecorators(field: FieldMetadata): string {
    const decorators = [];

    // GraphQL Field decorator
    decorators.push(`@Field(() => ${mapGraphQLType(field.type)}, { nullable: true })`);

    // Class-validator decorators
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
