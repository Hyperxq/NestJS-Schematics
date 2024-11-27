import { strings } from '@angular-devkit/core';
import * as pluralize from 'pluralize';
import { ImportDeclaration } from 'typescript';
import { repositoryImportData } from '../../../builder-generate/crud-graphql-mongo/imports.data';
import { createImportStatement, getImportAsText } from '../../AST';
import { ContentResult, IPropertyFactory, SchemaMetadata } from '../../interfaces';
import { toSinglularDasherize } from '../../to-string';

export class RepositoryFactory implements IPropertyFactory {
  generate(properties: SchemaMetadata[]): ContentResult[] {
    return properties
      .filter((p) => p.mainElement)
      .map(({ name, path }) => {
        const nameSinglularClassify = pluralize.singular(strings.classify(name));
        const nameSinglularDasherize = toSinglularDasherize(name);
        const { identifiers, moduleSpecifier } = repositoryImportData(nameSinglularClassify, nameSinglularDasherize);
        const importInput: ImportDeclaration = createImportStatement(identifiers as string[], moduleSpecifier);
        const imports = getImportAsText(importInput);

        return {
          name,
          path,
          content: '',
          imports,
        };
      });
  }
}
