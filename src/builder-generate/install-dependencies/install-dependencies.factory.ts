import { Rule } from '@angular-devkit/schematics';

export function installDependenciesFactory(): Rule {
  return () => {
    // You need to choose which installation do you want
    // * GraphQL:  Express and Apollo, Fastify and Apollo, Fastify and Mercurius
    // * Express and Apollo: npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
    // * Fastify and Apollo: npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql
    // * Fastify and Mercurius: npm i @nestjs/graphql @nestjs/mercurius graphql mercurius
    // * Database: Mongo/Mongoose, Postgress/TypeORM
    // @nestjs/graphql @nestjs/apollo @apollo/server graphql class-validator class-transformer @nestjs/mongoose mongoose
  };
}
