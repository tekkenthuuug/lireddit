import { Post } from './entities/Post';
import { User } from './entities/User';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';

import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

export default {
  entities: [Post, User],
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: process.env.POSTGRES_NAME,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  debug: !__prod__,
  type: 'postgresql',
} as Parameters<typeof MikroORM.init>[0];
