import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { Post } from 'entities/Post';
import { AppContext } from 'types';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { manager }: AppContext): Promise<Post[]> {
    return manager.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg('id') id: string,
    @Ctx() { manager }: AppContext,
  ): Promise<Post | null> {
    return manager.findOne(Post, { where: { id } });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { manager }: AppContext,
  ): Promise<Post> {
    const post = manager.create(Post, { title });

    await post.save();

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: string,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { manager }: AppContext,
  ): Promise<Post | null> {
    const post = await manager.findOne(Post, { where: { id } });

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      post.title = title;
      await post.save();
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: string,
    @Ctx() { manager }: AppContext,
  ): Promise<boolean> {
    await manager.delete(Post, { id });

    return true;
  }
}
