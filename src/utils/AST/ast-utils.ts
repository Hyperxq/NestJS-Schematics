// astUtils.ts
import {
  Expression,
  Node,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
  isArrayLiteralExpression,
  isCallExpression,
  isIdentifier,
  isNumericLiteral,
  isObjectLiteralExpression,
  isPropertyAssignment,
  isStringLiteral,
} from 'typescript';

/**
 * Extracts all key-value pairs from an object literal node.
 *
 * @param {ObjectLiteralExpression} objectLiteral - The object literal node representing property options.
 * @param {SourceFile} sourceFile - The source file containing the node, used for text extraction.
 * @returns {Record<string, any>} - An object with key-value pairs extracted from the object literal.
 */
export function extractPropertyOptions(
  objectLiteral: ObjectLiteralExpression,
  sourceFile: SourceFile,
): Record<string, any> {
  const options: Record<string, any> = {};
  objectLiteral.properties.forEach((prop) => {
    if (isPropertyAssignment(prop)) {
      const key: string = prop.name.getText(sourceFile);
      const value: any = getValueFromNode(prop.initializer, sourceFile);
      options[key] = value;
    }
  });

  return options;
}

/**
 * Extracts a value from a given AST node.
 * Handles literals, arrays, identifiers, and other expressions.
 *
 * @param {Expression} node - The node representing the value.
 * @param {SourceFile} sourceFile - The source file containing the node, used for text extraction.
 * @returns {any} - The value extracted from the node.
 */
export function getValueFromNode(node: Expression, sourceFile: SourceFile): any {
  if (isStringLiteral(node)) {
    return node.text;
  } else if (node.kind === SyntaxKind.TrueKeyword) {
    return true;
  } else if (node.kind === SyntaxKind.FalseKeyword) {
    return false;
  } else if (isNumericLiteral(node)) {
    return Number(node.text);
  } else if (isArrayLiteralExpression(node)) {
    return node.elements.map((element) => getValueFromNode(element, sourceFile));
  } else if (isObjectLiteralExpression(node)) {
    return extractPropertyOptions(node, sourceFile);
  } else if (isIdentifier(node)) {
    return node.getText(sourceFile);
  } else if (isCallExpression(node)) {
    // Check if the call expression is `Object.values`
    if (node.expression.getText(sourceFile) === 'Object.values') {
      return `Enum: ${node.arguments[0]?.getText(sourceFile)}`;
    }

    return `CallExpression: ${node.expression.getText(sourceFile)}`;
  }

  return node.getText(sourceFile);
}

/**
 * Traverses the AST and applies a visitor function to each node.
 *
 * @param {Node} node - The starting node to traverse from.
 * @param {(node: Node) => void} visitor - A visitor function to apply to each node.
 */
export function traverseAST(node: Node, visitor: (node: Node) => void): void {
  visitor(node);
  node.forEachChild((childNode) => traverseAST(childNode, visitor));
}
