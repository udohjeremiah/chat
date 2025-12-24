import fp from "fastify-plugin";

import { ServerToClientEvents } from "./io.js";

declare module "fastify" {
  interface FastifyInstance {
    emitToUser: <K extends keyof ServerToClientEvents>(
      userId: string,
      event: K,
      payload: Parameters<ServerToClientEvents[K]>[0],
    ) => void;
  }
}

/**
 * This plugin provides a helper for emitting Socket.IO
 * events to an active connection of a specific user.
 */
export default fp(
  async (fastify) => {
    fastify.decorate("emitToUser", async (userId, event, payload) => {
      const sockets = fastify.onlineUsers.get(userId);
      if (!sockets) return;

      for (const socketId of sockets) {
        fastify.io.to(socketId).emit(event, payload);
      }
    });
  },
  { name: "emit-to-user", dependencies: ["init-io"] },
);
