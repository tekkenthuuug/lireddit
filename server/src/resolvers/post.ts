import { Updoot } from '../entities/Updoot';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { isAuth } from '../middleware/isAuth';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  // Could grab this as a field with graphql
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 140) + '...';
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    // cursor pagination by date
    const realLimit = Math.min(50, limit);
    const replacements: any[] = [realLimit + 1];

    if (req.session.userId) {
      replacements.push(req.session.userId);
    }

    let cursorIndex = 3;

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIndex = replacements.length;
    }

    const posts = await getConnection().query(
      `
      SELECT p.*, 
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator,
      ${
        req.session.userId
          ? '(SELECT value FROM updoot WHERE "userId" = $2 AND "postId" = p.id) as "voteStatus"'
          : 'null as "voteStatus"'
      }
      FROM post p
      INNER JOIN public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIndex}` : ''}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimit + 1,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      await Post.delete(id);

      return true;
    } catch {
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const updoot = await Updoot.findOne({ where: { userId, postId } });

    // realValue must be [-1,1]
    const realValue = Math.max(Math.min(1, value), -1);

    if (updoot && updoot.value !== realValue) {
      // has voted and changing vote
      if (realValue === 0) {
        // removing vote
        await getConnection().transaction(async tm => {
          await tm.query(
            `
            DELETE FROM updoot
            WHERE "postId" = $1 AND "userId" = $2
          `,
            [postId, userId]
          );

          await tm.query(
            `
            UPDATE post
            SET points = points + $1
            WHERE id = $2;
          `,
            [-updoot.value, postId]
          );
        });
      } else if (updoot.value !== realValue) {
        // changing to opposite vote
        await getConnection().transaction(async tm => {
          await tm.query(
            `
            UPDATE updoot
            SET value = $1
            WHERE "postId" = $2 and "userId" = $3
          `,
            [realValue, postId, userId]
          );

          await tm.query(
            `
            UPDATE post
            SET points = points + $1
            WHERE id = $2;
          `,
            [realValue * 2, postId]
          );
        });
      }
    } else if (!updoot) {
      // never voted before
      await getConnection().transaction(async tm => {
        await tm.query(
          `
          INSERT INTO updoot ("userId", "postId", value)
          VALUES ($1, $2, $3);
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `,
          [realValue, postId]
        );
      });
    }

    return true;
  }
}
