import { strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import {
  MergeStrategy,
  Rule,
  apply,
  filter,
  mergeWith,
  move,
  renameTemplateFiles,
  url,
} from '@angular-devkit/schematics';
import * as pluralize from 'pluralize';
import { applyTemplates, renameEJSFiles } from './template';

export function addFilesToTree(
  options: { [key: string]: any },
  urlToMove: string,
  urlTemplates: string[],
  urlFiles = './files/ts',
): Rule {
  const template = apply(url(urlFiles), [
    filter((path) => urlTemplates.some((template) => path.endsWith(template))),
    applyTemplates({
      ...strings,
      ...options,
      lowercased: (name: string) => {
        const classifiedName = classify(name);

        return classifiedName.charAt(0).toLowerCase() + classifiedName.slice(1);
      },
      singular: (name: string) => pluralize.singular(name),
      plural: (name: string) => pluralize.plural(name),
      ent: (name: string) => name + '.entity',
    }),
    renameEJSFiles(),
    renameTemplateFiles(),
    move(urlToMove),
  ]);

  return mergeWith(template, MergeStrategy.AllowCreationConflict);
}
