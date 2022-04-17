import 'reflect-metadata';

import express from 'express';
import session from 'express-session';

import connectRedis from 'connect-redis';
import { createClient } from 'redis';

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';

import { buildSchema } from 'type-graphql';
import { PostResolver } from 'resolvers/post';
import { UserResolver } from 'resolvers/user';

import { AppContext } from 'types';
import { AppDataSource } from './data-source';

import { __prod__ } from './constants';

const main = async () => {
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });

  redisClient.connect().catch(console.error);

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: 'oiujhfjhaowijd',
      resave: false,
    }),
  );

  await AppDataSource.initialize();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): AppContext => ({
      manager: AppDataSource.manager,
      req: req as any,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
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
