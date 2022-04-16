import path from 'path';

import { DataSource } from 'typeorm';

import { Post } from './entities/Post';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: '',
  password: '',
  database: '',
  synchronize: true,
  logging: true,
  entities: [Post],
  subscribers: [],
  migrations: [path.join(__dirname, './migrations/*')],
});
