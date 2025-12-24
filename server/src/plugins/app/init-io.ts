import { ObjectId } from "@fastify/mongodb";
import fp from "fastify-plugin";

import type { Message } from "#schemas/message.js";
import type { User, UserWithoutPassword } from "#schemas/user.js";

import { TypedSocket } from "./io.js";

declare module "fastify" {
  interface FastifyInstance {
    onlineUsers: Map<string, Set<string>>;
  }
}

/**
 * This plugin initializes and configures all Socket.IO
 * event listeners for real-time application features.
 */
export default fp(
  async (fastify) => {
    fastify.decorate("onlineUsers", new Map<string, Set<string>>());

    fastify.io.use(async (socket, next) => {
      try {
        const { jwt } = socket.handshake.auth;
        if (!jwt) return next(new Error("Authentication token missing"));

        const payload = fastify.jwt.verify(jwt) as { userId: string };
        if (!payload.userId) return next(new Error("Invalid token"));

        socket.data.userId = payload.userId;
        next();
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next(error as any);
      }
    });

    fastify.io.on("connection", async (socket: TypedSocket) => {
      const userId = socket.data.userId;
      if (!userId) return;

      fastify.log.info(`User connected: ${userId}`);

      let sockets = fastify.onlineUsers.get(userId);
      const isFirstConnection = !sockets;

      if (!sockets) {
        sockets = new Set();
        fastify.onlineUsers.set(userId, sockets);
      }

      sockets.add(socket.id);

      if (isFirstConnection) {
        fastify.io.emit("presence:on", userId);

        const database = fastify.getDatabase();
        const messagesCollection = database.collection<Message>(
          fastify.env.MONGODB_COLL_MESSAGES,
        );

        const receiverObjectId = new ObjectId(userId);

        const result = await messagesCollection.updateMany(
          { receiverId: receiverObjectId, status: "sent" },
          { $set: { status: "delivered" } },
        );

        if (result.modifiedCount > 0) {
          const senders = await messagesCollection
            .aggregate([
              { $match: { receiverId: receiverObjectId, status: "delivered" } },
              { $group: { _id: "$senderId" } },
            ])
            .toArray();

          for (const { _id: senderId } of senders) {
            fastify.emitToUser(
              senderId.toString(),
              "message:delivered",
              userId,
            );
          }
        }
      }

      socket.on("presence:getAll", () =>
        socket.emit("presence:users", [...fastify.onlineUsers.keys()]),
      );

      socket.on("presence:get", (targetUserId) => {
        const isOnline = fastify.onlineUsers.has(targetUserId);
        socket.emit("presence:user", { userId: targetUserId, isOnline });
      });

      socket.on("presence:on", () => fastify.io.emit("presence:on", userId));

      socket.on("presence:off", () => fastify.io.emit("presence:off", userId));

      socket.on("typing:start", (receiverId) =>
        fastify.emitToUser(receiverId, "typing:start", userId),
      );

      socket.on("typing:stop", (receiverId) =>
        fastify.emitToUser(receiverId, "typing:stop", userId),
      );

      socket.on("recording:start", (receiverId) =>
        fastify.emitToUser(receiverId, "recording:start", userId),
      );

      socket.on("recording:stop", (receiverId) =>
        fastify.emitToUser(receiverId, "recording:stop", userId),
      );

      socket.on("uploading:start", (receiverId) =>
        fastify.emitToUser(receiverId, "uploading:start", userId),
      );

      socket.on("uploading:stop", (receiverId) =>
        fastify.emitToUser(receiverId, "uploading:stop", userId),
      );

      socket.on("message:send", async (payload) => {
        if (!payload?.receiverId) return;
        if (!payload.text && !payload.voice && !payload.image) return;

        const senderObjectId = new ObjectId(userId);
        const receiverObjectId = new ObjectId(payload.receiverId);
        const messageId = new ObjectId();

        const database = fastify.getDatabase();
        const usersCollection = database.collection<UserWithoutPassword>(
          fastify.env.MONGODB_COLL_USERS,
        );
        const messagesCollection = database.collection<Message>(
          fastify.env.MONGODB_COLL_MESSAGES,
        );

        const sender = await usersCollection.findOne(
          { _id: senderObjectId },
          { projection: { password: 0 } },
        );

        const receiver = await usersCollection.findOne(
          { _id: receiverObjectId },
          { projection: { password: 0 } },
        );

        if (!sender || !receiver) return;

        const receiverSockets = fastify.onlineUsers.get(payload.receiverId);
        const isReceiverOnline = !!receiverSockets?.size;

        const newMessage: Message = {
          _id: messageId,
          senderId: senderObjectId,
          receiverId: receiverObjectId,
          ...(payload.text && { text: payload.text }),
          ...(payload.voice && { voice: payload.voice }),
          ...(payload.image && { image: payload.image }),
          status: isReceiverOnline ? "delivered" : "sent",
          sentAt: new Date(),
        };

        await messagesCollection.insertOne(newMessage);

        const messageWithStringIds = {
          ...newMessage,
          _id: messageId.toString(),
          senderId: userId,
          receiverId: payload.receiverId,
        };

        fastify.emitToUser(userId, "message:sent", {
          user: { ...receiver, _id: payload.receiverId },
          message: messageWithStringIds,
        });

        fastify.emitToUser(payload.receiverId, "message:sent", {
          user: { ...sender, _id: userId },
          message: messageWithStringIds,
        });
      });

      socket.on("message:read", async (senderId) => {
        const database = fastify.getDatabase();
        const messagesCollection = database.collection<Message>(
          fastify.env.MONGODB_COLL_MESSAGES,
        );

        const result = await messagesCollection.updateMany(
          {
            senderId: new ObjectId(senderId),
            receiverId: new ObjectId(userId),
            status: { $in: ["sent", "delivered"] },
          },
          { $set: { status: "read" } },
        );

        if (result.modifiedCount > 0) {
          fastify.emitToUser(senderId, "message:read", userId);
          fastify.emitToUser(userId, "message:read", senderId);
        }
      });

      socket.on("disconnect", async () => {
        fastify.log.info(`Socket disconnected: ${socket.id}`);

        const userSockets = fastify.onlineUsers.get(userId);
        if (!userSockets) return;

        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          const database = fastify.getDatabase();
          const usersCollection = database.collection<User>(
            fastify.env.MONGODB_COLL_USERS,
          );

          await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { lastSeen: new Date() } },
          );

          fastify.onlineUsers.delete(userId);
          fastify.io.emit("presence:off", userId);
        }
      });
    });
  },
  { name: "init-io", dependencies: ["io", "mongo", "get-database"] },
);
