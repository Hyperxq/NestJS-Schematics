import { strings } from '@angular-devkit/core';
import * as pluralize from 'pluralize';
import { ImportDeclaration } from 'typescript';
import { moduleImportsData } from '../../../builder-generate/crud-graphql-mongo/imports.data';
import { moduleProvidersData } from '../../../builder-generate/crud-graphql-mongo/providers.data';
import { createImportsStatement, getImportsAsText } from '../../AST';
import { ContentResult, IPropertyFactory, SchemaMetadata } from '../../interfaces';
import { toSinglularClassify, toSinglularDasherize } from '../../to-string';

export class ModuleFactory implements IPropertyFactory {
  generate(properties: SchemaMetadata[]): ContentResult[] {
    return properties
      .filter((p) => p.mainElement)
      .map(({ name, path }) => {
        const nameSinglularClassify = toSinglularClassify(name);
        const nameSinglularDasherize = toSinglularDasherize(name);

        const importsInput: ImportDeclaration[] = createImportsStatement(
          moduleImportsData(nameSinglularClassify, nameSinglularDasherize),
        );

        const providers = moduleProvidersData(nameSinglularClassify).join(', ');

        const imports = getImportsAsText(importsInput);

        const content = `providers: [${providers}],
        controllers: [],
        imports: [
            DatabaseModule,
            MongooseModule.forFeature([
                {
                    name: ${name}.name,
                    schema: ${name}Schema,
                    collection: '${strings.camelize(pluralize.plural(name))}',
                },
            ]),
        ],`;

        return {
          name,
          path,
          content,
          imports,
        };
      });
  }
}
