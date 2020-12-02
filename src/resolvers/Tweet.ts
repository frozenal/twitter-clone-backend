import { Tweet } from "../entitites/Tweet";
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

@InputType()
class TweetInput {
  @Field()
  content: string;

  @Field()
  authorId: number;
}

@ObjectType()
class TweetResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Tweet, { nullable: true })
  tweet?: Tweet;
}

@Resolver()
export class TweetResolver {
  //get tweets
  @Query(() => [Tweet])
  async tweets(@Ctx() { TweetRepository }: MyContext) {
    const tweets = TweetRepository.find({ relations: ["author"] });

    return tweets;
  }

  @Mutation(() => TweetResponse)
  async createTweet(
    @Arg("options") options: TweetInput,
    @Ctx() { TweetRepository, UserRepository }: MyContext
  ): Promise<TweetResponse> {
    let newTweet = new Tweet();

    newTweet.content = options.content;

    newTweet.authorId = options.authorId;

    let author = await UserRepository.findOne({
      where: { id: options.authorId },
    });

    if (!author) {
      return { errors: [{ field: "authorId", message: "User not found." }] };
    }

    newTweet.author = author;

    let tweet = await TweetRepository.save(newTweet);

    return { tweet: tweet! };
  }
}
