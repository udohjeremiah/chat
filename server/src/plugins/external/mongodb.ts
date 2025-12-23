import mongodb, { type FastifyMongodbOptions } from "@fastify/mongodb";
import fp from "fastify-plugin";

/**
 * This plugin adds a mongodb connection you
 * can share in every part of your server.
 *
 * @see {@link https://github.com/fastify/fastify-mongodb}
 */
export default fp<FastifyMongodbOptions>(
  async (fastify) => {
    fastify.register(mongodb, {
      appName: fastify.env.NAME,
      url: fastify.env.MONGODB_URL,
      database: fastify.env.MONGODB_DATABASE,
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
      forceClose: true,
    });
  },
  { name: "mongo", dependencies: ["env"] },
);
