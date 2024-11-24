import { Rule } from '@angular-devkit/schematics';
import { spawnAsync } from '../../utils';

export function installDependenciesFactory({ packageManager, kind }: { packageManager: string; kind: string }): Rule {
  return async () => {
    // You need to choose which installation do you want
    // * GraphQL-Mongoose:  Express and Apollo, Fastify and Apollo, Fastify and Mercurius
    // * Express and Apollo: npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
    // * Fastify and Apollo: npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql
    // * Fastify and Mercurius: npm i @nestjs/graphql @nestjs/mercurius graphql mercurius
    // * Database: Mongo/Mongoose, Postgress/TypeORM
    // ? Install dependencies
    // eslint-disable-next-line max-len
    // * GraphQL-Mongoose: @nestjs/graphql @nestjs/apollo @apollo/server graphql graphql-scalars class-validator class-transformer @nestjs/mongoose mongoose joi @nestjs/config
    const installationChoose = {
      'GraphQL-Mongoose':
        // eslint-disable-next-line max-len
        '@nestjs/graphql @nestjs/apollo @apollo/server graphql graphql-scalars class-validator class-transformer @nestjs/mongoose mongoose joi @nestjs/config',
    };
    const packageManagerCommands = {
      npm: 'install',
      yarn: 'add',
      pnpm: 'add',
      cnpm: 'install',
      bun: 'add',
    };

    try {
      await spawnAsync(
        packageManager,
        [packageManagerCommands[packageManager], `${installationChoose[kind]} --save-dev --save-exact prettier`],
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
      );
    } catch (error) {}
  };
}
