import { Field, Int, ObjectType } from "type-graphql";
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Tweet } from "./Tweet";
import { User } from "./User";

@Entity()
@ObjectType()
export class TweetLike {
  @Field(() => Int)
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likedPosts)
  user: User;

  @Field(() => Int)
  @PrimaryColumn()
  tweetId: number;

  @Field(() => Tweet)
  @ManyToOne(() => Tweet, (tweet) => tweet.userLikes)
  tweet: Tweet;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}
