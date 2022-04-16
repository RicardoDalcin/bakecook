import 'reflect-metadata';

import express from 'express';

import { ApolloServer } from 'apollo-server-express';

import { buildSchema } from 'type-graphql';
import { PostResolver } from 'resolvers/post';
import { UserResolver } from 'resolvers/user';

import { AppDataSource } from './data-source';

const main = async () => {
  const app = express();

  await AppDataSource.initialize();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ manager: AppDataSource.manager }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.get('/', (_, res) => {
    res.send({ alright: 'ok' });
  });

  app.listen(3030, () => {
    console.log('Server started on localhost:3030');
  });
};

main();
