import { ConnectionOptions } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';

import dotenv from 'dotenv';
import { __prod__ } from './constants';
import { Updoot } from './entities/Updoot';

if (!__prod__) {
  dotenv.config();
}

export default {
  type: 'postgres',
  database: process.env.POSTGRES_NAME,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  logging: !__prod__,
  synchronize: true,
  entities: [Post, User, Updoot],
  migrations: [path.join(__dirname, './migrations/*')],
} as ConnectionOptions;
