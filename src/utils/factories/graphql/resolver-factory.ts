import { ImportDeclaration } from 'typescript';
import { resolverImportsData } from '../../../builder-generate/crud-graphql-mongo/imports.data';
import { createImportsStatement, getImportsAsText } from '../../AST';
import { ContentResult, IPropertyFactory, SchemaMetadata } from '../../interfaces';
import { toSinglularClassify, toSinglularDasherize } from '../../to-string';

export class ResolverFactory implements IPropertyFactory {
  generate(properties: SchemaMetadata[] = []): ContentResult[] {
    return properties
      .filter((p) => p.mainElement)
      .map(({ name, path }) => {
        const nameSinglularClassify = toSinglularClassify(name);
        const nameSinglularDasherize = toSinglularDasherize(name);

        const importsInput: ImportDeclaration[] = createImportsStatement(
          resolverImportsData(nameSinglularClassify, nameSinglularDasherize),
        );

        const imports = getImportsAsText(importsInput);

        return {
          name,
          path,
          content: '',
          imports,
        };
      });
  }
}
