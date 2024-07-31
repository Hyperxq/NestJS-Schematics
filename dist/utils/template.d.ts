import { Rule } from '@angular-devkit/schematics';

declare function renameEJSFiles(): Rule;
declare function renameExtensionFiles(templateFilenameRe: RegExp): Rule;
declare function applyTemplates<T extends object>(options: T): Rule;

export { applyTemplates, renameEJSFiles, renameExtensionFiles };
