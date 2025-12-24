import fp from "fastify-plugin";
import { z } from "zod";
import zodToMongoSchema from "zod-to-mongo-schema";

/**
 * This plugin initializes and sets up the
 * database and collections for the application.
 */
export default fp(
  async (fastify) => {
    try {
      const database = fastify.getDatabase();

      // Define your collections and their validation rules
      const collections: Record<string, { validator: object }> = {
        users: {
          validator: {
            $jsonSchema: zodToMongoSchema(
              z.object({
                _id: z.unknown().meta({ bsonType: "objectId" }),
                name: z.string().min(3),
                username: z.string().min(3),
                password: z.string().min(8),
                avatar: z.string(),
                lastSeen: z.unknown().meta({ bsonType: "date" }).nullable(),
                createdAt: z.unknown().meta({ bsonType: "date" }),
              }),
            ),
          },
        },
        messages: {
          validator: {
            $jsonSchema: zodToMongoSchema(
              z.object({
                _id: z.unknown().meta({ bsonType: "objectId" }),
                senderId: z.unknown().meta({ bsonType: "objectId" }),
                receiverId: z.unknown().meta({ bsonType: "objectId" }),
                text: z.string().optional(),
                voice: z
                  .object({ url: z.url(), publicId: z.string() })
                  .optional(),
                image: z
                  .object({ url: z.url(), publicId: z.string() })
                  .optional(),
                status: z.enum(["sent", "delivered", "read"]),
                sentAt: z.unknown().meta({ bsonType: "date" }),
              }),
            ),
          },
        },
      };

      // Loop through and create each collection if missing
      for (const [name, { validator }] of Object.entries(collections)) {
        const collection = await database.listCollections({ name }).toArray();
        const exists = collection.length > 0;

        if (exists) {
          fastify.log.info(
            `'${name}' collection already exists — updating validator...`,
          );
          await database.command({ collMod: name, validator });
          fastify.log.info(`'${name}' collection validator updated.`);
        } else {
          fastify.log.info(`Creating '${name}' collection...`);
          await database.createCollection(name, { validator });
          fastify.log.info(`'${name}' collection created successfully.`);
        }
      }

      fastify.log.info("Database initialization completed.");
    } catch (error) {
      fastify.log.error(error);
    }
  },
  { name: "init-database", dependencies: ["mongo", "get-database"] },
);
