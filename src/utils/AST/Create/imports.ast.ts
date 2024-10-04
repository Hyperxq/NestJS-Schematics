import { EmitHint, ImportClause, ImportDeclaration, ScriptTarget, createSourceFile, factory } from 'typescript';
import { ImportInput } from '../../interfaces/ast.interfaces';
import { printer } from '../printer.ast';

/**
 * Creates a default import statement.
 *
 * @export
 * @param {string} identifier - The identifier for the default import (e.g., `home` in `import home from './'`).
 * @param {string} url - The module specifier (e.g., `'./'`).
 * @returns {ImportDeclaration} - The generated import declaration AST node.
 */
export function createDefaultImportStatement(identifier: string, url: string): ImportDeclaration {
  return factory.createImportDeclaration(undefined, createImportClause(identifier), factory.createStringLiteral(url));
}

/**
 * Creates a named imports statement.
 *
 * @export
 * @param {string[]} identifiers - The identifiers to import (e.g., `['myVar', 'myVar2']`).
 * @param {string} url - The module specifier (e.g., `'./'`).
 * @returns {ImportDeclaration} - The generated import declaration AST node.
 */
export function createNamedImportsStatement(identifiers: string[], url: string): ImportDeclaration {
  const namedImports = factory.createNamedImports(
    identifiers.map((id) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(id))),
  );

  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(false, undefined, namedImports),
    factory.createStringLiteral(url),
  );
}

/**
 * Creates an import clause based on the given identifier.
 *
 * @param {string} identifier - The identifier for the default import clause.
 * @returns {ImportClause} - The generated import clause AST node.
 */
function createImportClause(identifier: string): ImportClause {
  return factory.createImportClause(false, factory.createIdentifier(identifier), undefined);
}

/**
 * Creates an import statement based on the input type (single or multiple identifiers).
 *
 * @export
 * @param {string} identifier - A single identifier for default import.
 * @param {string} moduleSpecifier - The module specifier (e.g., `'./'`).
 * @returns {ImportDeclaration} - The generated import declaration AST node.
 */
export function createImportStatement(identifier: string, moduleSpecifier: string): ImportDeclaration;

/**
 * Creates an import statement based on the input type (single or multiple identifiers).
 *
 * @export
 * @param {string[]} identifiers - Multiple identifiers for named imports.
 * @param {string} moduleSpecifier - The module specifier (e.g., `'./'`).
 * @returns {ImportDeclaration} - The generated import declaration AST node.
 */
export function createImportStatement(identifiers: string[], moduleSpecifier: string): ImportDeclaration;

/**
 * Implementation of createImportStatement with overloads.
 *
 * @param {string | string[]} identifiers - Either a single identifier or an array of identifiers.
 * @param {string} moduleSpecifier - The module specifier (e.g., `'./'`).
 * @returns {ImportDeclaration} - The generated import declaration AST node.
 */
export function createImportStatement(identifiers: string | string[], moduleSpecifier: string): ImportDeclaration {
  return Array.isArray(identifiers)
    ? createNamedImportsStatement(identifiers, moduleSpecifier)
    : createDefaultImportStatement(identifiers, moduleSpecifier);
}

/**
 * Creates multiple import statements based on an array of inputs.
 *
 * @export
 * @param {Array<{ identifiers: string | string[]; moduleSpecifier: string }>} inputs
 * @returns {ImportDeclaration[]}
 */
export function createImportsStatement(inputs: ImportInput[]): ImportDeclaration[] {
  return inputs.map(({ identifiers, moduleSpecifier }) => {
    // Use type narrowing before calling the overloaded function
    if (Array.isArray(identifiers)) {
      // Call with string[] overload
      return createImportStatement(identifiers, moduleSpecifier);
    } else {
      // Call with string overload
      return createImportStatement(identifiers, moduleSpecifier);
    }
  });
}

export function getImportsAsText(imports: Array<ImportDeclaration>): string {
  return imports.map((i) => getImportAsText(i)).join('\n');
}

export function getImportAsText(importDeclaration: ImportDeclaration) {
  const sourceFile = createSourceFile('temp.ts', '', ScriptTarget.ESNext, false, undefined);

  return printer.printNode(EmitHint.Unspecified, importDeclaration, sourceFile);
}
