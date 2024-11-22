import { Types, ValidateOpts } from 'mongoose';

/**
 * Represents a custom validator function for schema fields.
 */
type ValidatorFunction = (value: any) => boolean;

/**
 * Interface representing a custom Mongoose validator object.
 */
interface CustomValidator {
  validator: ValidatorFunction;
  message?: string | ((props: any) => string);
}

/**
 * Base interface for schema field properties, excluding `Map` type-specific definitions.
 */
interface SchemaTypeOptions<T = any> {
  type?:
    | T
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | DateConstructor
    | typeof Types.ObjectId
    | 'String'
    | 'Number'
    | 'Boolean'
    | 'Date'
    | 'ObjectId';
  required?: boolean | [boolean, string] | ((this: any) => boolean);
  default?: T | (() => T);
  enum?: T[] | { values: T[]; message: string };
  validate?: ValidatorFunction | CustomValidator | CustomValidator[] | ValidateOpts<T, any>; // Provide type arguments for ValidateOpts
  unique?: boolean;
  sparse?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  minlength?: number;
  maxlength?: number;
  match?: RegExp | [RegExp, string];
  alias?: string;
  index?: boolean | number | Record<string, any>;
  immutable?: boolean | (() => boolean);
  select?: boolean;
  get?: (value: T) => T;
  set?: (value: T) => T;
  ref?: string | ((this: any) => string);
  populate?: Record<string, any>;
  expires?: number | string;
  of?: SchemaTypeOptions; // For nested types or array types
}

/**
 * Interface representing options for String fields.
 */
interface StringSchemaTypeOptions extends SchemaTypeOptions<string> {
  type: StringConstructor | 'String';
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  minlength?: number;
  maxlength?: number;
  match?: RegExp | [RegExp, string];
}

/**
 * Interface representing options for Number fields.
 */
interface NumberSchemaTypeOptions extends SchemaTypeOptions<number> {
  type: NumberConstructor | 'Number';
  min?: number;
  max?: number;
}

/**
 * Interface representing options for Date fields.
 */
interface DateSchemaTypeOptions extends SchemaTypeOptions<Date> {
  type: DateConstructor | 'Date';
  min?: Date;
  max?: Date;
}

/**
 * Interface representing options for Boolean fields.
 */
interface BooleanSchemaTypeOptions extends SchemaTypeOptions<boolean> {
  type: BooleanConstructor | 'Boolean';
}

/**
 * Interface representing options for ObjectId fields.
 */
interface ObjectIdSchemaTypeOptions extends SchemaTypeOptions<Types.ObjectId> {
  type: typeof Types.ObjectId | 'ObjectId';
  ref?: string;
  auto?: boolean;
}

/**
 * Interface representing options for Array fields.
 */
interface ArraySchemaTypeOptions extends SchemaTypeOptions<any[]> {
  type: any[];
  items?: SchemaTypeOptions | SchemaTypeOptions[];
}

/**
 * Interface representing options for Map fields.
 * This interface excludes the `type` property from `SchemaTypeOptions` to allow for `"Map"`.
 */
interface MapSchemaTypeOptions {
  type: 'Map'; // String to indicate 'Map' schema type
  of: SchemaTypeOptions; // Type of values in the map
  required?: boolean | [boolean, string] | ((this: any) => boolean);
  default?: Map<string, any> | (() => Map<string, any>);
  validate?: ValidatorFunction | CustomValidator | CustomValidator[] | ValidateOpts<Map<string, any>, any>;
  unique?: boolean;
  sparse?: boolean;
  index?: boolean | number | Record<string, any>;
  immutable?: boolean | (() => boolean);
}

/**
 * Interface for Mongoose Schema Types for a Field.
 */
export type MongooseSchemaField = { isIndex?: boolean } & (
  | StringSchemaTypeOptions
  | NumberSchemaTypeOptions
  | DateSchemaTypeOptions
  | BooleanSchemaTypeOptions
  | ObjectIdSchemaTypeOptions
  | ArraySchemaTypeOptions
  | MapSchemaTypeOptions
  | SchemaTypeOptions
); // Generic type for other possible schema options

/**
 * Interface representing a Mongoose Schema Definition for a single field.
 */
export interface MongooseSchemaDefinitionField {
  [fieldName: string]: MongooseSchemaField;
}

/**
 * Interface representing a complete Mongoose schema.
 */
export interface MongooseSchemaDefinition {
  [fieldName: string]: MongooseSchemaDefinitionField | MongooseSchemaField;
}
