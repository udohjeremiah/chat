import { ObjectId } from "@fastify/mongodb";
import fp from "fastify-plugin";

import type { UserWithoutPassword } from "#schemas/user.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
  interface FastifyRequest {
    authUser?: UserWithoutPassword;
  }
}

/**
 * This plugin provides an authentication logic
 * that you can use to protect your routes.
 */
export default fp(
  async (fastify) => {
    fastify.decorate("authenticate", async (request, reply) => {
      try {
        await request.jwtVerify();

        const database = fastify.getDatabase();

        const user = await database
          .collection<UserWithoutPassword>(fastify.env.MONGODB_COLL_USERS)
          .findOne(
            { _id: new ObjectId(request.user.userId) },
            { projection: { password: 0 } },
          );

        if (!user) {
          return reply.code(401).send({
            success: false,
            message: "Access denied",
          });
        }

        request.authUser = user;
      } catch (error) {
        return reply.code(401).send({
          success: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          message: (error as any).message,
        });
      }
    });
  },
  { name: "authenticate", dependencies: ["mongo", "get-database", "jwt"] },
);
