import type { FastifyPluginAsync } from "fastify";

import auth from "#routes/api/auth.js";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.register(auth, { prefix: "/auth" });
};

export default api;
