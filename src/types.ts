import { ObjectType, Field } from "type-graphql";
import { Repository } from "typeorm";
import { Tweet } from "./entitites/Tweet";
import { User } from "./entitites/User";

export type MyContext = {
  TweetRepository: Repository<Tweet>;
  UserRepository: Repository<User>;
};

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}
