import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import express from "express";
import session from "express-session";
import cors from "cors";
import { UserResolver } from "./resolvers/User";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Tweet } from "./entitites/Tweet";
import { User } from "./entitites/User";
import { __prod__ } from "./constants";
import { MyContext } from "./types";
import { TweetResolver } from "./resolvers/Tweet";
import Redis from "ioredis";
import { TweetLike } from "./entitites/TweetLIke";

require("dotenv").config();

const main = async () => {
  createConnection({
    type: "postgres",
    url: process.env.POSTGRES_CONNECTION_URL,
    // url: process.env.DATABASE_URL,
    entities: [Tweet, User, TweetLike],
    synchronize: __prod__,
  }).then(async (connection) => {
    const TweetRepository = connection.getRepository(Tweet);
    const UserRepository = connection.getRepository(User);
    const LikeRepository = connection.getRepository(TweetLike);

    const RedisStore = connectRedis(session);
    const redis = new Redis({ host: process.env.REDIS_HOST || "127.0.0.1" });

    // TweetRepository.delete({});
    // UserRepository.delete({});

    const app = express();

    // app.use(
    //   cors({
    //     origin: "http://localhost:3000",
    //     credentials: true,
    //   })
    // );

    const corsOptions = { credentials: true, origin: "http://localhost:3000" };

    app.use(
      session({
        name: "qid",
        store: new RedisStore({
          client: redis,
          disableTouch: true,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365,
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        },
        saveUninitialized: false,
        secret: "lolthisisasecret",
        resave: false,
      })
    );

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [TweetResolver, UserResolver],
        validate: false,
      }),
      context: ({ req, res }): MyContext => ({
        TweetRepository,
        UserRepository,
        LikeRepository,
        req,
        res,
      }),
    });

    apolloServer.applyMiddleware({ app, cors: corsOptions });

    app.listen(4000, () => {
      console.log("Server is live on port 4000");
    });
  });
};

main();
