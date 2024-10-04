// mongooseSchemaParser.ts
import {
  Node,
  ObjectLiteralExpression,
  ScriptTarget,
  SourceFile,
  createSourceFile,
  isCallExpression,
  isNewExpression,
  isObjectLiteralExpression,
  isPropertyAssignment,
  isVariableDeclaration,
} from 'typescript';
import { getValueFromNode, traverseAST } from '../ast-utils';

interface SchemaParseResult {
  properties: Record<string, any>;
  indexes: string[];
}

/**
 * Extracts properties and indexes from a given Mongoose schema TypeScript file content.
 *
 * @param {string} schemaFileContent - The content of the Mongoose schema TypeScript file as a string.
 * @returns {SchemaParseResult} - An object containing the properties (with details) and indexes (only property names) of the schema.
 */
export function parseMongooseSchemaFromContent(schemaFileContent: string): SchemaParseResult {
  const sourceFile: SourceFile = createSourceFile('schema.ts', schemaFileContent, ScriptTarget.Latest, true);
  const properties: Record<string, any> = {};
  const indexes: string[] = [];

  /**
   * Parses the properties object and extracts all the properties.
   *
   * @param {ObjectLiteralExpression} node - The node representing the properties object.
   */
  function extractProperties(node: ObjectLiteralExpression): void {
    node.properties.forEach((property) => {
      if (isPropertyAssignment(property) && isObjectLiteralExpression(property.initializer)) {
        const propertyName: string = property.name.getText(sourceFile);
        properties[propertyName] = getValueFromNode(property.initializer, sourceFile);
      }
    });
  }

  /**
   * Extracts the names of the properties used as indexes.
   *
   * @param {Node} node - The node representing a method call.
   */
  function extractIndexes(node: Node): void {
    if (isCallExpression(node)) {
      const methodName: string = node.expression.getText(sourceFile);
      if (methodName.endsWith('.index')) {
        const [indexObject] = node.arguments;
        if (indexObject && isObjectLiteralExpression(indexObject)) {
          indexObject.properties.forEach((prop) => {
            if (isPropertyAssignment(prop)) {
              const indexName: string = prop.name.getText(sourceFile);
              indexes.push(indexName);
            }
          });
        }
      }
    }
  }

  /**
   * Visitor function to traverse the AST and extract schema properties and indexes.
   *
   * @param {Node} node - The current node being traversed.
   */
  function visit(node: Node): void {
    // Handle Scenario 1: Directly defined properties in the schema
    if (isVariableDeclaration(node) && node.initializer) {
      if (isNewExpression(node.initializer) && node.initializer.expression.getText(sourceFile) === 'mongoose.Schema') {
        if (node.initializer.arguments && node.initializer.arguments.length > 0) {
          const propertiesObject = node.initializer.arguments[0];
          if (propertiesObject && isObjectLiteralExpression(propertiesObject)) {
            extractProperties(propertiesObject);
          }
        }
      }
    }

    // Handle Scenario 2: Schema.add method to define properties
    if (isCallExpression(node) && node.expression.getText(sourceFile).endsWith('.add')) {
      const [propertiesObject] = node.arguments;
      if (propertiesObject && isObjectLiteralExpression(propertiesObject)) {
        extractProperties(propertiesObject);
      }
    }

    // Handle Scenario 3: Schema.index method to define indexes
    extractIndexes(node);
  }

  // Traverse the AST to extract schema properties and indexes using the reusable traverseAST function.
  traverseAST(sourceFile, visit);

  return { properties, indexes };
}
