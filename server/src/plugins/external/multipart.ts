import multipart, { type FastifyMultipartOptions } from "@fastify/multipart";
import fp from "fastify-plugin";

/**
 * This plugin enables parsing of multipart content-type.
 *
 * @see {@link https://github.com/fastify/fastify-multipart}
 */
export default fp<FastifyMultipartOptions>(
  async (fastify) => {
    fastify.register(multipart);
  },
  { name: "multipart" },
);
