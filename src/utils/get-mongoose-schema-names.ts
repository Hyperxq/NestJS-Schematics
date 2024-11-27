import * as ts from 'typescript';

interface IdentifySchemasOptions {
  target: string; // Target construct to match, e.g., "mongoose.Schema"
}

function parseSourceToAst(sourceText: string): ts.SourceFile {
  try {
    return ts.createSourceFile('temp.ts', sourceText, ts.ScriptTarget.Latest, true);
  } catch (error) {
    throw new Error('Failed to parse source text into an AST.');
  }
}

function findSchemasInAst(ast: ts.SourceFile, options: IdentifySchemasOptions): string[] {
  const schemaNames: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node)) {
      const initializer = node.initializer;

      if (initializer && ts.isNewExpression(initializer)) {
        const expression = initializer.expression;

        if (ts.isPropertyAccessExpression(expression) && expression.getText() === options.target) {
          if (node.name && ts.isIdentifier(node.name)) {
            schemaNames.push(node.name.text);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(ast);

  return schemaNames;
}

export function identifySchemasUsingAst(
  sourceText: string,
  options: IdentifySchemasOptions = { target: 'mongoose.Schema' },
): string[] {
  const ast = parseSourceToAst(sourceText);

  return findSchemasInAst(ast, options);
}
