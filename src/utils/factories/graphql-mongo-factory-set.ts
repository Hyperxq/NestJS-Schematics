import { IFactory, IFactorySet, IPropertyFactory } from '../interfaces';
import {
  EntityFactory,
  GetDTOFactory,
  RepositoryFactory,
  ResolverFactory,
  ServiceFactory,
  UpdateDTOFactory,
} from './graphql';
import { ModuleFactory } from './mongoose';
import { PlaceHolderFactory } from './placeholder-factory';

/**
 * A set of factories specifically for Mongoose schemas.
 */
export class GraphQLMongoFactorySet implements IFactorySet {
  repositoryFactory(): IFactory {
    return new RepositoryFactory();
  }
  serviceFactory(): IFactory {
    return new ServiceFactory();
  }
  resolverFactory(): IFactory {
    return new ResolverFactory();
  }
  moduleFactory(): IFactory {
    return new ModuleFactory();
  }
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
    return new PlaceHolderFactory();
  }
}
