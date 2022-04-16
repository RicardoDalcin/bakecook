import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: '',
  password: '',
  database: '',
  synchronize: true,
  logging: true,
  entities: [User, Post],
  migrations: ['dist/migrations/*.js'],
  subscribers: [],
});
