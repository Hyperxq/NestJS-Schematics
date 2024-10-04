import { ImportInput } from '../../utils/interfaces/ast.interfaces';

export const serviceImportsData = (nameSinglularClassify: string, nameSinglularDasherize: string): ImportInput[] => [
  {
    identifiers: [`${nameSinglularClassify}Repository`],
    moduleSpecifier: `./${nameSinglularDasherize}.repository`,
  },
  {
    identifiers: [`${nameSinglularClassify}`],
    moduleSpecifier: `./entities/${nameSinglularDasherize}.entity`,
  },
  {
    identifiers: [`Create${nameSinglularClassify}`],
    moduleSpecifier: `./dto/create-${nameSinglularDasherize}.input.dto`,
  },
  {
    identifiers: [`Get${nameSinglularClassify}`],
    moduleSpecifier: `./dto/get-${nameSinglularDasherize}.input.dto`,
  },
  {
    identifiers: [`Update${nameSinglularClassify}Args`],
    moduleSpecifier: `./dto/update-${nameSinglularDasherize}.input.dto`,
  },
];

export const resolverImportsData = (nameSinglularClassify: string, nameSinglularDasherize: string): ImportInput[] => [
  {
    identifiers: [`${nameSinglularClassify}Service`],
    moduleSpecifier: `./${nameSinglularDasherize}.service`,
  },
  {
    identifiers: [`${nameSinglularClassify}`],
    moduleSpecifier: `./entities/${nameSinglularDasherize}.entity`,
  },
  {
    identifiers: [`Create${nameSinglularClassify}`],
    moduleSpecifier: `./dto/create-${nameSinglularDasherize}.input.dto`,
  },
  {
    identifiers: [`Get${nameSinglularClassify}`],
    moduleSpecifier: `./dto/get-${nameSinglularDasherize}.input.dto`,
  },
  {
    identifiers: [`Update${nameSinglularClassify}Args`],
    moduleSpecifier: `./dto/update-${nameSinglularDasherize}.input.dto`,
  },
];

export const moduleImportsData = (nameSinglularClassify: string, nameSinglularDasherize: string): ImportInput[] => [
  {
    identifiers: [`${nameSinglularClassify}Resolver`],
    moduleSpecifier: `./${nameSinglularDasherize}.resolver`,
  },
  {
    identifiers: [`${nameSinglularClassify}Service`],
    moduleSpecifier: `./${nameSinglularDasherize}.service`,
  },
  {
    identifiers: [`${nameSinglularClassify}`],
    moduleSpecifier: `./entities/${nameSinglularDasherize}.entity`,
  },
  {
    identifiers: [`${nameSinglularClassify}Schema`],
    moduleSpecifier: `./schemas/${nameSinglularDasherize}.schema`,
  },
  {
    identifiers: [`${nameSinglularClassify}Repository`],
    moduleSpecifier: `./${nameSinglularDasherize}.repository`,
  },
];

export const repositoryImportData = (nameSinglularClassify: string, nameSinglularDasherize: string): ImportInput => ({
  identifiers: [nameSinglularClassify],
  moduleSpecifier: `./entities/${nameSinglularDasherize}.entity`,
});
