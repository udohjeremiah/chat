import { ObjectId } from "@fastify/mongodb";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import type { Message } from "#schemas/message.js";
import type { UserWithoutPassword } from "#schemas/user.js";

const defaultResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const users: FastifyPluginAsyncZod = async (fastify): Promise<void> => {
  fastify.route({
    method: "DELETE",
    url: "/:userId",
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

      const userId = new ObjectId(request.params.userId);
      if (!userId.equals(request.authUser._id)) {
        return reply.code(404).send({
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

      const query = { $or: [{ senderId: userId }, { receiverId: userId }] };

      // eslint-disable-next-line unicorn/no-array-callback-reference
      const cursor = messagesCollection.find(query);

      for await (const message of cursor) {
        if (message.voice?.publicId) {
          fastify.cloudinary.uploader.destroy(message.voice.publicId, {
            resource_type: "video",
          });
        }

        if (message.image?.publicId) {
          fastify.cloudinary.uploader.destroy(message.image.publicId, {
            resource_type: "image",
          });
        }
      }

      await messagesCollection.deleteMany(query);
      await usersCollection.deleteOne({ _id: userId });

      request.authUser = undefined;

      reply.code(200).send({
        success: true,
        message: "Account and associated messages deleted successfully",
      });
    },
  });
};

export default users;
