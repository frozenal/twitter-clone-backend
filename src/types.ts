import { Request } from "express";
import { ObjectType, Field } from "type-graphql";
import { Repository } from "typeorm";
import { Tweet } from "./entitites/Tweet";
import { User } from "./entitites/User";

export type MyContext = {
  TweetRepository: Repository<Tweet>;
  UserRepository: Repository<User>;
  req: Request;
};

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}
