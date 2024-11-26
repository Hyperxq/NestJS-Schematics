import { IFactorySet, IPropertyFactory } from '../interfaces';
import { EntityFactory, GetDTOFactory, UpdateDTOFactory } from './graphql';

/**
 * A set of factories specifically for Mongoose schemas.
 */
export class GraphQLFactorySet implements IFactorySet {
  getEntityFactory(): IPropertyFactory {
    return new EntityFactory();
  }

  getCreateDTOFactory(): IPropertyFactory {
    return new GetDTOFactory();
  }

  getUpdateDTOFactory(): IPropertyFactory {
    return new UpdateDTOFactory();
  }

  getGetDTOFactory(): IPropertyFactory {
    return new GetDTOFactory();
  }

  getSchemaFactory(): IPropertyFactory {
    return new GetDTOFactory(); // Placeholder for now
  }
}
