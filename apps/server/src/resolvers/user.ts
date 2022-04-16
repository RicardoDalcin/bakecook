import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import argon2 from 'argon2';

import { AppContext } from 'types';

import { User } from 'entities/User';

@InputType()
class RegisterInput {
  @Field()
  name!: string;

  @Field()
  lastName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  birthdate!: Date;
}

@InputType()
class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
class FieldError {
  @Field()
  field!: string;

  @Field()
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: RegisterInput,
    @Ctx() { manager }: AppContext,
  ): Promise<UserResponse> {
    if (options.name.length <= 2) {
      return {
        errors: [
          {
            field: 'name',
            message: 'Name must contain at least two letters',
          },
        ],
      };
    }

    if (options.lastName.length <= 2) {
      return {
        errors: [
          {
            field: 'lastName',
            message: 'Last name must contain at least two letters',
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password name must contain at least three letters',
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = manager.create(User, {
      ...options,
      email: options.email.toLowerCase(),
      password: hashedPassword,
    });

    try {
      await user.save();
    } catch (err: any) {
      if (err.code === '23505') {
        return {
          errors: [{ field: 'email', message: 'This email is already in use' }],
        };
      }
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: LoginInput,
    @Ctx() { manager }: AppContext,
  ): Promise<UserResponse> {
    const user = await manager.findOne(User, {
      where: { email: options.email },
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'email/password',
            message: 'Your email or password is incorrect',
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'email/password',
            message: 'Your email or password is incorrect',
          },
        ],
      };
    }

    return { user };
  }
}
