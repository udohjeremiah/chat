import type { FastifyPluginAsync } from "fastify";

import auth from "#routes/api/auth.js";
import chats from "#routes/api/chats.js";
import users from "#routes/api/users.js";

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.register(auth, { prefix: "/auth" });

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook("onRequest", protectedRoutes.authenticate);
    protectedRoutes.register(users, { prefix: "/users" });
    protectedRoutes.register(chats, { prefix: "/chats" });
  });
};

export default api;
