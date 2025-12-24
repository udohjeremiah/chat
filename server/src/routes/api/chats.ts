import { ObjectId } from "@fastify/mongodb";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import { type Message, messageWithStringIdsSchema } from "#schemas/message.js";
import {
  type UserWithoutPassword,
  userWithStringIdsSchema,
} from "#schemas/user.js";

const defaultResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const chats: FastifyPluginAsyncZod = async (fastify): Promise<void> => {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      response: {
        default: defaultResponseSchema,
        200: defaultResponseSchema.extend({
          data: z.object({
            chats: z.array(
              z.object({
                user: userWithStringIdsSchema.omit({ password: true }),
                lastMessage: messageWithStringIdsSchema,
                unreadMessages: z.number(),
              }),
            ),
          }),
        }),
      },
    },
    handler: async function (request, reply) {
      if (!request.authUser) {
        return reply.code(401).send({
          success: false,
          message: "Access denied",
        });
      }

      const database = fastify.getDatabase();
      const usersCollection = database.collection<UserWithoutPassword>(
        fastify.env.MONGODB_COLL_USERS,
      );
      const messagesCollection = database.collection<Message>(
        fastify.env.MONGODB_COLL_MESSAGES,
      );

      const userId = new ObjectId(request.authUser._id);

      const chatsAgg = await messagesCollection
        .aggregate([
          { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
          { $sort: { sentAt: -1 } },
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ["$senderId", userId] },
                  "$receiverId",
                  "$senderId",
                ],
              },
              lastMessage: { $first: "$$ROOT" },
              unreadMessages: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$receiverId", userId] },
                        { $ne: ["$status", "read"] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
        .toArray();

      if (chatsAgg.length === 0) {
        return reply.code(200).send({
          success: true,
          message: "No chats found",
          data: { chats: [] },
        });
      }

      const userIds = chatsAgg.map((c) => c["_id"]);

      const users = await usersCollection
        .find({ _id: { $in: userIds } }, { projection: { password: 0 } })
        .toArray();

      const userMap = new Map(users.map((u) => [u._id.toString(), u]));

      const chats = chatsAgg.map((chat) => {
        const user = userMap.get(chat["_id"].toString())!;

        return {
          user: {
            ...user,
            _id: user._id.toString(),
          },
          lastMessage: {
            ...chat["lastMessage"],
            _id: chat["lastMessage"]._id.toString(),
            senderId: chat["lastMessage"].senderId.toString(),
            receiverId: chat["lastMessage"].receiverId.toString(),
          },
          unreadMessages: chat["unreadMessages"],
        };
      });

      reply.code(200).send({
        success: true,
        message: "Chats fetched successfully",
        data: { chats },
      });
    },
  });

  fastify.route({
    method: "GET",
    url: "/:userId/messages",
    schema: {
      params: z.object({ userId: z.string() }),
      response: {
        default: defaultResponseSchema,
        200: defaultResponseSchema.extend({
          data: z.object({
            chat: z.array(messageWithStringIdsSchema),
          }),
        }),
      },
    },
    handler: async function (request, reply) {
      if (!request.authUser) {
        return reply.code(401).send({
          success: false,
          message: "Access denied",
        });
      }

      const userId = new ObjectId(request.authUser._id);
      const activeChatUserId = new ObjectId(request.params.userId);

      const database = fastify.getDatabase();
      const messagesCollection = database.collection<Message>(
        fastify.env.MONGODB_COLL_MESSAGES,
      );

      const messages = await messagesCollection
        .find({
          $or: [
            { senderId: userId, receiverId: activeChatUserId },
            { senderId: activeChatUserId, receiverId: userId },
          ],
        })
        // eslint-disable-next-line unicorn/no-array-sort
        .sort({ sentAt: 1 })
        .toArray();

      const messagesWithStringIds = messages.map((message) => ({
        ...message,
        _id: message._id.toString(),
        senderId: message.senderId.toString(),
        receiverId: message.receiverId.toString(),
      }));

      reply.code(200).send({
        success: true,
        message: "Chat fetched successfully",
        data: { chat: messagesWithStringIds },
      });
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:userId/messages",
    schema: {
      params: z.object({ userId: z.string() }),
      response: {
        default: defaultResponseSchema,
      },
    },
    handler: async function (request, reply) {
      if (!request.authUser) {
        return reply.code(401).send({
          success: false,
          message: "Access denied",
        });
      }

      const userId = new ObjectId(request.authUser._id);
      const activeChatUserId = new ObjectId(request.params.userId);

      const database = fastify.getDatabase();
      const messagesCollection = database.collection<Message>(
        fastify.env.MONGODB_COLL_MESSAGES,
      );

      const query = {
        $or: [
          { senderId: userId, receiverId: activeChatUserId },
          { senderId: activeChatUserId, receiverId: userId },
        ],
      };

      // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
      const cursor = messagesCollection.find(query, {
        projection: { voice: 1, image: 1 },
      });

      let hasMessages = false;

      for await (const message of cursor) {
        hasMessages = true;

        if (message.voice?.publicId) {
          await fastify.cloudinary.uploader.destroy(message.voice.publicId, {
            resource_type: "video",
          });
        }

        if (message.image?.publicId) {
          await fastify.cloudinary.uploader.destroy(message.image.publicId, {
            resource_type: "image",
          });
        }
      }

      if (!hasMessages) {
        return reply.code(200).send({
          success: true,
          message: "No conversation found with this user",
        });
      }

      await messagesCollection.deleteMany(query);

      reply.code(200).send({
        success: true,
        message: "Chat deleted successfully",
      });
    },
  });

  fastify.route({
    method: "GET",
    url: "/start-new-chat/:username",
    schema: {
      params: z.object({ username: z.string().min(3) }),
      response: {
        default: defaultResponseSchema,
        200: defaultResponseSchema.extend({
          data: z.object({
            receiver: userWithStringIdsSchema.omit({ password: true }),
          }),
        }),
      },
    },
    handler: async function (request, reply) {
      if (!request.authUser) {
        return reply.code(401).send({
          success: false,
          message: "Access denied",
        });
      }

      const database = fastify.getDatabase();
      const usersCollection = database.collection<UserWithoutPassword>(
        fastify.env.MONGODB_COLL_USERS,
      );

      const username = request.params.username.trim().toLowerCase();
      if (username === request.authUser.username) {
        return reply.code(400).send({
          success: false,
          message: "You cannot start a chat with yourself",
        });
      }

      const receiver = await usersCollection.findOne(
        { username },
        { projection: { password: 0 } },
      );
      if (!receiver) {
        return reply.code(404).send({
          success: false,
          message: "Username not found",
        });
      }

      reply.code(200).send({
        success: true,
        message: "User exists and chat can be started",
        data: {
          receiver: {
            ...receiver,
            _id: receiver._id.toString(),
          },
        },
      });
    },
  });
};

export default chats;
