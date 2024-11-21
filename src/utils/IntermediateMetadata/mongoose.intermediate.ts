import { FieldMetadata, SchemaMetadata } from '../interfaces/agnostic-data.interfaces';
import { Intermediate } from '../interfaces/intermediate.interface';
import { MongooseSchemaDefinitionField, MongooseSchemaField } from '../interfaces/mongoose-schema.interfaces';

export class MongooseIntermediate implements Intermediate<MongooseSchemaDefinitionField, SchemaMetadata> {
  parseData(mongooseSchemas: MongooseSchemaDefinitionField[]): SchemaMetadata {
    const fields: FieldMetadata[] = [];

    mongooseSchemas.forEach((schema) => {
      Object.entries(schema).forEach(([fieldName, fieldDefinition]) => {
        const parsedField = this.parseField(fieldName, fieldDefinition);
        fields.push(parsedField);
      });
    });

    return {
      name: '', // Dynamically set later if needed
      fields,
      relationships: [], // Keep an empty array for now
    };
  }

  private parseField(fieldName: string, fieldDefinition: MongooseSchemaField): FieldMetadata {
    return {
      name: fieldName,
      type: this.mapType(fieldDefinition.type),
      isRequired: !!fieldDefinition.required,
      defaultValue: fieldDefinition.default,
      isArray: Array.isArray(fieldDefinition.type),
      ref: null, // Explicitly set ref to null since relationships are ignored for now
      validations: this.extractValidations(fieldDefinition),
      isUnique: !!fieldDefinition.unique,
      isIndexed: !!fieldDefinition.index,
    };
  }

  private mapType(type: any): string {
    if (Array.isArray(type)) {
      return 'array';
    }

    switch (type) {
      case String:
      case 'String':
        return 'string';
      case Number:
      case 'Number':
        return 'number';
      case Boolean:
      case 'Boolean':
        return 'boolean';
      case Date:
      case 'Date':
        return 'date';
      case 'ObjectId':
      case 'Schema.Types.ObjectId':
        return 'ObjectId';
      case 'Map':
        return 'map';
      default:
        return 'unknown';
    }
  }

  private extractValidations(fieldDefinition: MongooseSchemaField): Record<string, any> {
    const validations: Record<string, any> = {};

    // Check for minlength or min
    if ('minlength' in fieldDefinition && fieldDefinition.minlength !== undefined) {
      validations.minlength = fieldDefinition.minlength;
    }
    if ('min' in fieldDefinition && fieldDefinition.min !== undefined) {
      validations.min = fieldDefinition.min;
    }

    // Check for maxlength or max
    if ('maxlength' in fieldDefinition && fieldDefinition.maxlength !== undefined) {
      validations.maxlength = fieldDefinition.maxlength;
    }
    if ('max' in fieldDefinition && fieldDefinition.max !== undefined) {
      validations.max = fieldDefinition.max;
    }

    // Check for enum
    if ('enum' in fieldDefinition && fieldDefinition.enum !== undefined) {
      validations.enum = Array.isArray(fieldDefinition.enum) ? fieldDefinition.enum : fieldDefinition.enum.values;
    }

    // Check for match (regex)
    if ('match' in fieldDefinition && fieldDefinition.match !== undefined) {
      validations.regex = fieldDefinition.match instanceof RegExp ? fieldDefinition.match : fieldDefinition.match[0];
    }

    return validations;
  }
}
