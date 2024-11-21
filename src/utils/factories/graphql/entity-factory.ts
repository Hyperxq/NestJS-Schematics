import { IPropertyFactory } from '../../interfaces/property-factory.interfaces';

export class EntityFactory implements IPropertyFactory {
  generate(properties: Record<string, any>): string {
    const className = 'Entity';
    const fields = Object.keys(properties)
      .map((key) => `${key}: ${properties[key].type};`)
      .join('\n  ');

    return `export class ${className} {\n  ${fields}\n}`;
  }
}
