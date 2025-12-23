import jwt, { type FastifyJWTOptions } from "@fastify/jwt";
import fp from "fastify-plugin";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: { userId: string };
  }
}

/**
 * This plugin provides JWT utils.
 *
 * @see {@link https://github.com/fastify/fastify-jwt}
 */
export default fp<FastifyJWTOptions>(
  async (fastify) => {
    fastify.register(jwt, { secret: fastify.env.JWT_SECRET });
  },
  { name: "jwt", dependencies: ["env"] },
);
