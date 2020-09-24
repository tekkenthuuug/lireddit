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
import { User } from '../entities/User';

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
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 140) + '...';
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, updootLoader }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedPosts> {
    // cursor pagination by date
    const realLimit = Math.min(50, limit);
    const replacements: any[] = [realLimit + 1];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      SELECT p.* 
      FROM post p
      ${cursor ? `where p."createdAt" < $2` : ''}
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) {
      return null;
    }

    const updatedPost = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();

    return updatedPost.raw[0] as Post;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    try {
      const post = await Post.findOne(id);

      if (!post) {
        return false;
      }

      if (post.creatorId !== req.session.userId) {
        throw new Error('not authorized');
      }

      await getConnection().transaction(async tm => {
        await tm.query(
          `
          DELETE FROM Updoot
          WHERE "postId" = $1
        `,
          [id]
        );

        await tm.query(
          `
          DELETE FROM Post
          WHERE id = $1
        `,
          [id]
        );
      });

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
