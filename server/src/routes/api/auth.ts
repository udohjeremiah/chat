import { adventurer } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  type User,
  type UserWithoutId,
  userWithoutPasswordSchema,
} from "#schemas/user.js";

const defaultResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const auth: FastifyPluginAsyncZod = async (fastify): Promise<void> => {
  fastify.route({
    method: "POST",
    url: "/signup",
    schema: {
      body: z.object({
        name: z.string().min(3),
        username: z.string().min(3),
        password: z.string().min(8),
      }),
      response: {
        default: defaultResponseSchema,
      },
    },
    handler: async function (request, reply) {
      const { name, username, password } = request.body;

      const database = fastify.getDatabase();
      const usersCollection = database.collection<UserWithoutId>(
        fastify.env.MONGODB_COLL_USERS,
      );

      const user = await usersCollection.findOne({ username });
      if (user) {
        return reply.code(400).send({
          success: false,
          message: "Username already in use",
        });
      }

      const salt = genSaltSync(10);
      const hashedPassword = hashSync(password, salt);
      const avatar = createAvatar(adventurer, {
        seed: username.toLowerCase(),
      }).toDataUri();

      const newUser = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: hashedPassword,
        avatar,
        // eslint-disable-next-line unicorn/no-null
        lastSeen: null,
        createdAt: new Date(),
      };

      await usersCollection.insertOne(newUser);

      reply.code(201).send({
        success: true,
        message: "User registered successfully",
      });
    },
  });

  fastify.route({
    method: "POST",
    url: "/signin",
    schema: {
      body: z.object({
        username: z.string().min(3),
        password: z.string().min(8),
      }),
      response: {
        default: defaultResponseSchema,
        200: defaultResponseSchema.extend({
          data: z.object({ userId: z.string(), token: z.string() }),
        }),
      },
    },
    handler: async function (request, reply) {
      const { username, password } = request.body;

      const database = fastify.getDatabase();
      const usersCollection = database.collection<User>(
        fastify.env.MONGODB_COLL_USERS,
      );

      const user = await usersCollection.findOne({ username });
      if (!user) {
        return reply.code(404).send({
          success: false,
          message: "Invalid credentials",
        });
      }

      if (!compareSync(password, user.password)) {
        return reply.code(404).send({
          success: false,
          message: "Invalid credentials",
        });
      }

      const userId = user._id.toString();
      const token = await reply.jwtSign({ userId });

      reply.code(200).send({
        success: true,
        message: "User login successfully",
        data: { userId, token },
      });
    },
  });

  fastify.route({
    method: "GET",
    url: "/verify",
    schema: {
      response: {
        default: defaultResponseSchema,
        200: defaultResponseSchema.extend({
          data: z.object({ user: userWithoutPasswordSchema }),
        }),
      },
    },
    onRequest: fastify.authenticate,
    handler: async function (request, reply) {
      if (!request.authUser) {
        return reply.code(401).send({
          success: false,
          message: "Access denied",
        });
      }

      reply.code(200).send({
        success: true,
        message: "User authenticated successfully",
        data: { user: request.authUser },
      });
    },
  });
};

export default auth;
