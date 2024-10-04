import { NewLineKind, SourceFile, createPrinter } from 'typescript';

// Create a printer to print the AST node
export const printer = createPrinter({
  newLine: NewLineKind.LineFeed,
});

// Print the generated code as text
export const print = (elementToPrint: SourceFile) => printer.printFile(elementToPrint);
