export interface FieldMetadata {
  name: string; // The name of the field
  type: string; // The type of the field (e.g., "string", "number", "boolean")
  isRequired?: boolean; // Whether the field is required
  defaultValue?: any; // The default value of the field, if any
  validations?: {
    min?: number; // Minimum value (for numbers)
    max?: number; // Maximum value (for numbers)
    regex?: RegExp; // Regular expression (for strings)
    enum?: string[]; // Possible values for an enum
  };
  isArray?: boolean; // Whether the field is an array
  ref?: string; // Name of the referenced entity (for relationships)
  isUnique?: boolean; // Whether the field has a unique constraint
  isIndexed?: boolean; // Whether the field is indexed
}

export interface RelationshipMetadata {
  fieldName: string; // The name of the field representing the relationship
  parentEntity: string; // The name of the parent entity where the relationship is defined
  targetEntity: string; // The name of the referenced or related entity
  relationType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'; // The type of relationship
}

export interface SchemaMetadata {
  name: string; // The name of the schema or entity
  fields: FieldMetadata[]; // A list of fields in the schema
  relationships: RelationshipMetadata[]; // A list of relationships in the schema
}
