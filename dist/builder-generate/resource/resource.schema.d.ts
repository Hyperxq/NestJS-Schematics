import {Path} from '@angular-devkit/core';

export interface SchematicOptions {
  /**
   * The name of the resource-old.
   */
  name: string;
  /**
   * The path to create the resource-old.
   */
  path?: string | Path;
  /**
   * The source root path
   */
  sourceRoot?: string;
  /**
   * Application language.
   */
  language?: string;
  /**
   * Specifies if spec files are generated.
   */
  spec?: boolean;
  /**
   * Specifies the file suffix of spec files.
   * @default "spec"
   */
  specFileSuffix?: string;
  /**
   * The path to insert the module declaration.
   */
  module?: Path;
  /**
   * Metadata name affected by declaration insertion.
   */
  metadata?: string;
  /**
   * Directive to insert declaration in module.
   */
  skipImport?: boolean;
  /**
   * The transport layer.
   */
  type?: 'graphql-code-first';
  /**
   * When true, CRUD entry points are generated.
   */
  crud?: boolean;
  /**
   * Flag to indicate if a directory is created.
   */
  flat?: boolean;
  /**
   * When true, "@nestjs/swagger" dependency is installed in the project.
   */
  isSwaggerInstalled?: boolean;

  dbStrategy?: 'mongoose';
}
