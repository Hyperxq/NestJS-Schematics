import { EntityFactory } from './graphql/entity-factory';
import { GetDTOFactory } from './graphql/get-dto-factory';
import { IFactorySet, IPropertyFactory } from '../interfaces/property-factory.interfaces';

/**
 * A set of factories specifically for Mongoose schemas.
 */
export class GraphQLFactorySet implements IFactorySet {
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
