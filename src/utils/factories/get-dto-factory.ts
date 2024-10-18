// factories/GetDTOFactory.ts
import { IPropertyFactory } from './property-factory.interfaces';

export class GetDTOFactory implements IPropertyFactory {
  generate(properties: Record<string, any>): string {
    const className = 'GetDTO';
    const fields = Object.keys(properties)
      .map((key) => `${key}: ${properties[key].type};`)
      .join('\n  ');

    return `export class ${className} {\n  ${fields}\n}`;
  }
}
