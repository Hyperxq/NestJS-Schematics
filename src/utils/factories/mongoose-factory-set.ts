import { EntityFactory } from './entity-factory';
import { GetDTOFactory } from './get-dto-factory';
import { IFactorySet, IPropertyFactory } from './property-factory.interfaces';

/**
 * A set of factories specifically for Mongoose schemas.
 */
export class MongooseFactorySet implements IFactorySet {
  getEntityFactory(): IPropertyFactory {
    return new EntityFactory();
  }

  getCreateDTOFactory(): IPropertyFactory {
    return new GetDTOFactory(); // Placeholder for now
  }

  getUpdateDTOFactory(): IPropertyFactory {
    return new GetDTOFactory(); // Placeholder for now
  }

  getGetDTOFactory(): IPropertyFactory {
    return new GetDTOFactory();
  }

  getSchemaFactory(): IPropertyFactory {
    return new GetDTOFactory(); // Placeholder for now
  }
}
