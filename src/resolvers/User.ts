import { User } from "../entitites/User";
import { FieldError, MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import * as argon2 from "argon2";
import { FindOneOptions } from "typeorm";

@InputType()
class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  handle: string;

  @Field({ nullable: true })
  user_bio?: string;
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
  // get all users (in the future, likely add an arg to allow searching)
  @Query(() => [User])
  async users(@Ctx() { UserRepository }: MyContext) {
    const users = UserRepository.find({
      relations: ["tweets"],
      join: {
        alias: "user",
        leftJoinAndSelect: {
          likes: "user.likedPosts",
          tweet: "likes.tweet",
          tweetAuthor: "tweet.author",
        },
      },
    });

    return users;
  }

  // get single user
  @Query(() => UserResponse)
  async user(
    @Arg("userId") userId: number,
    @Ctx() { UserRepository }: MyContext
  ): Promise<UserResponse> {
    let user: User | undefined;
    user = await UserRepository.findOne({
      where: { id: userId },
      relations: ["tweets"],
    });
    if (user == undefined) {
      return {
        errors: [
          {
            field: "userId",
            message: "There is no user with that ID.",
          },
        ],
      };
    }

    return { user: user! };
  }

  // register user
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => RegisterInput) options: RegisterInput,
    @Ctx() { UserRepository, req }: MyContext
  ): Promise<UserResponse> {
    if (
      options.username.length == 0 ||
      options.email.length == 0 ||
      options.password.length == 0
    ) {
      return {
        errors: [
          {
            field:
              options.username.length == 0
                ? "username"
                : options.email.length == 0
                ? "email"
                : "password",
            message:
              options.username.length == 0
                ? "Username cannot be left blank."
                : options.email.length == 0
                ? "Email cannot be left blank."
                : "Password cannot be left blank.",
          },
        ],
      };
      ``;
    }

    let newUser = new User();

    newUser.username = options.username;

    try {
      const hash = await argon2.hash(options.password);
      newUser.password = hash;
    } catch (err) {
      return err;
    }

    newUser.email = options.email;

    if (options.user_bio) {
      newUser.user_bio = options.user_bio;
    }

    if (options.handle) {
      newUser.handle = options.handle;
    } else {
      newUser.handle = options.username;
    }

    let user: User;
    try {
      user = await UserRepository.save(newUser);
    } catch (error) {
      if (error.code == "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "There is already a user registered with that email.",
            },
          ],
        };
      }
    }

    req.session!.userId = user!.id;

    return { user: user! };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("handleOrEmail") handleOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { UserRepository, req }: MyContext
  ): Promise<UserResponse> {
    if (handleOrEmail.length == 0) {
      return {
        errors: [
          {
            field: "handleOrEmail",
            message: "You must have a handle or an email!",
          },
        ],
      };
    }

    let whereString: FindOneOptions<User> = handleOrEmail.includes("@")
      ? { where: { email: handleOrEmail } }
      : { where: { handle: handleOrEmail } };
    let user = await UserRepository.findOne(whereString);
    if (!user) {
      return {
        errors: [
          {
            field: "handleOrEmail",
            message: "There is no user with that handle or email!",
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "The passwords do not match!",
          },
        ],
      };
    }

    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
