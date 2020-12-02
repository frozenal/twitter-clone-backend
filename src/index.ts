import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { UserResolver } from "./resolvers/User";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Tweet } from "./entitites/Tweet";
import { User } from "./entitites/User";
import { __prod__ } from "./constants";
import { MyContext } from "./types";
import { TweetResolver } from "./resolvers/Tweet";
import Redis from "ioredis";

require("dotenv").config();

const main = async () => {
  createConnection({
    type: "postgres",
    url: "postgres://postgres:postgres@db:5432/postgres",
    // url: process.env.DATABASE_URL,
    entities: [Tweet, User],
    synchronize: __prod__,
  }).then(async (connection) => {
    const TweetRepository = connection.getRepository(Tweet);
    const UserRepository = connection.getRepository(User);

    const redis = new Redis({ host: process.env.REDIS_HOST || "127.0.0.1" });

    console.log(await redis.ping());

    // TweetRepository.delete({});
    // UserRepository.delete({});

    const app = express();

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [TweetResolver, UserResolver],
        validate: false,
      }),
      context: (): MyContext => ({
        TweetRepository,
        UserRepository,
      }),
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
      console.log("Server is live on port 4000");
    });
  });
};

main();
