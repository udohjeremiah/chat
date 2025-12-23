import cors, { type FastifyCorsOptions } from "@fastify/cors";
import fp from "fastify-plugin";

/**
 * This plugin enables the use of CORS.
 *
 * @see {@link https://github.com/fastify/fastify-cors}
 */
export default fp<FastifyCorsOptions>(
  async (fastify) => {
    fastify.register(cors, {
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    });
  },
  { name: "cors" },
);
