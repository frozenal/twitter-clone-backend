import { Field, Int, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TweetLike } from "./TweetLIke";
import { User } from "./User";

@Entity()
@ObjectType()
export class Tweet {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  content: string;

  @Field()
  @Column()
  authorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.tweets, { onDelete: "CASCADE" })
  author: User;

  @Field(() => [TweetLike])
  @OneToMany(() => TweetLike, (like) => like.tweet, { onDelete: "CASCADE" })
  userLikes: TweetLike[];

  @Field()
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
