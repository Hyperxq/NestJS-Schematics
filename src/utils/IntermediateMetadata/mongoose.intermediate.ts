import { SchemaInfo } from '../../builder-generate/resource/resource.interfaces';
import { AgnosticFieldType } from '../enums/agnostic-types.enum';
import { FieldMetadata, SchemaMetadata } from '../interfaces/agnostic-data.interfaces';
import { Intermediate } from '../interfaces/intermediate.interface';
import { MongooseSchemaField } from '../interfaces/mongoose-schema.interfaces';

export class MongooseIntermediate implements Intermediate<SchemaInfo, SchemaMetadata[]> {
  parseData(schemas: SchemaInfo[]): SchemaMetadata[] {
    const schemaMetadataList: SchemaMetadata[] = [];

    schemas.forEach(({ properties, name, path, fileContent, skipIndexes }) => {
      const fields: FieldMetadata[] = Object.entries(properties).map(([fieldName, fieldDefinition]) =>
        this.parseField(fieldName, fieldDefinition),
      );

      schemaMetadataList.push({
        name,
        path,
        fileContent,
        skipIndexes,
        fields,
        relationships: [],
      });
    });

    return schemaMetadataList;
  }

  private parseField(fieldName: string, fieldDefinition: MongooseSchemaField): FieldMetadata {
    return {
      name: fieldName,
      type: this.mapType(fieldDefinition.type),
      isRequired: Boolean(fieldDefinition.required),
      defaultValue: fieldDefinition.default,
      isArray: Array.isArray(fieldDefinition.type),
      ref: null, // Explicitly set ref to null since relationships are ignored for now
      validations: this.extractValidations(fieldDefinition),
      isUnique: !!fieldDefinition.unique,
      isIndexed: !!fieldDefinition?.isIndex,
    };
  }

  private mapType(type: any): AgnosticFieldType {
    if (Array.isArray(type)) {
      return AgnosticFieldType.ARRAY;
    }

    switch (type) {
      case String:
      case 'String':
        return AgnosticFieldType.STRING;
      case Number:
      case 'Number':
        return AgnosticFieldType.NUMBER;
      case Boolean:
      case 'Boolean':
        return AgnosticFieldType.BOOLEAN;
      case Date:
      case 'Date':
        return AgnosticFieldType.DATE;
      case 'ObjectId':
      case 'Schema.Types.ObjectId':
        return AgnosticFieldType.OBJECT_ID;
      case 'Map':
        return AgnosticFieldType.MAP;
      default:
        return AgnosticFieldType.UNKNOWN;
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
