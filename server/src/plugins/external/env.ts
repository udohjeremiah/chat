import env, { type FastifyEnvOptions } from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    env: {
      NODE_ENV: string;
      NAME: string;
      PORT: number;
      JWT_SECRET: string;
      MONGODB_URL: string;
      MONGODB_DATABASE: string;
      MONGODB_COLL_USERS: string;
      MONGODB_COLL_MESSAGES: string;
      CLOUDINARY_URL: string;
      CLIENT_URL: string;
    };
  }
}

const options: FastifyEnvOptions = {
  confKey: "env",
  schema: {
    type: "object",
    required: [
      "NODE_ENV",
      "NAME",
      "PORT",
      "JWT_SECRET",
      "MONGODB_URL",
      "MONGODB_DATABASE",
      "MONGODB_COLL_USERS",
      "MONGODB_COLL_MESSAGES",
      "CLOUDINARY_URL",
      "CLIENT_URL",
    ],
    properties: {
      NODE_ENV: {
        type: "string",
        default: "development",
      },
      NAME: {
        type: "string",
        default: "Server",
      },
      PORT: {
        type: "number",
        default: 3000,
      },
      JWT_SECRET: {
        type: "string",
        default: "my-jwt-secret",
      },
      MONGODB_URL: {
        type: "string",
        default: "mongodb://localhost:27017",
      },
      MONGODB_DATABASE: {
        type: "string",
        default: "my-db",
      },
      MONGODB_COLL_USERS: {
        type: "string",
        default: "my-users",
      },
      MONGODB_COLL_MESSAGES: {
        type: "string",
        default: "my-messages",
      },
      CLOUDINARY_URL: {
        type: "string",
        default: "my-cloudinary-url",
      },
      CLIENT_URL: {
        type: "string",
        default: "*",
      },
    },
  },
  dotenv: true,
  data: process.env,
};

/**
 * This plugin helps to check environment variables.
 *
 * @see {@link https://github.com/fastify/fastify-env}
 */
export default fp<FastifyEnvOptions>(
  async (fastify) => {
    fastify.register(env, options);
  },
  { name: "env" },
);
