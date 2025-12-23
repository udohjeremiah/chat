import { FastifyPluginAsync } from "fastify";

const health: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/health", async function (request, reply) {
    return reply.send("Server is live!");
  });
};

export default health;
