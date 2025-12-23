import type { FastifyMongoObject } from "@fastify/mongodb";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    getDatabase: () => NonNullable<FastifyMongoObject["db"]>;
  }
}

/**
 * This plugin provides a typed and safe
 * accessor for the MongoDB database.
 */
export default fp(
  async (fastify) => {
    fastify.decorate("getDatabase", () => {
      const database = fastify.mongo.db;
      if (!database) throw new Error("MongoDB database is not initialized");
      return database;
    });
  },
  { name: "get-database", dependencies: ["mongo"] },
);
