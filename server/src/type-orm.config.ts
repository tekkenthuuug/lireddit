import { ConnectionOptions } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import 'dotenv-safe/config';
import { __prod__ } from './constants';
import { Updoot } from './entities/Updoot';

export default {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  logging: !__prod__,
  // synchronize: true,
  entities: [Post, User, Updoot],
  migrations: [path.join(__dirname, './migrations/*')],
} as ConnectionOptions;
