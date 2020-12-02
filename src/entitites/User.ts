import { Field, Int, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tweet } from "./Tweet";

@Entity()
@ObjectType()
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  password: string;

  @Field()
  @Column({ unique: true })
  handle: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  user_bio: string;

  @Field(() => [Tweet])
  @OneToMany(() => Tweet, (tweet) => tweet.author, {
    nullable: true,
    cascade: true,
  })
  tweets: Tweet[];

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
