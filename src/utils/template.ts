import { normalize } from '@angular-devkit/core';
import {
  FileEntry,
  PathTemplateData,
  Rule,
  applyContentTemplate,
  applyPathTemplate,
  composeFileOperators,
  forEach,
  when,
} from '@angular-devkit/schematics';

const TEMPLATE_FILENAME_RE = /\.ejs$/;
const EXTENSION_FILES_ALLOW = ['.ejs', '.template'];

export function renameEJSFiles(): Rule {
  return renameExtensionFiles(TEMPLATE_FILENAME_RE);
}

export function renameExtensionFiles(templateFilenameRe: RegExp): Rule {
  return forEach((entry) => {
    if (entry.path.match(TEMPLATE_FILENAME_RE)) {
      return {
        content: entry.content,
        path: normalize(entry.path.replace(templateFilenameRe, '')),
      };
    } else {
      return entry;
    }
  });
}

export function applyTemplates<T extends object>(options: T): Rule {
  return forEach(
    when(
      (path) => EXTENSION_FILES_ALLOW.some((e) => path.endsWith(e)),
      composeFileOperators([
        applyContentTemplate(options),
        // See above for this weird cast.
        applyPathTemplate(options as {} as PathTemplateData),
        (entry) => {
          return {
            content: entry.content,
            path: entry.path.replace(TEMPLATE_FILENAME_RE, ''),
          } as FileEntry;
        },
      ]),
    ),
  );
}
