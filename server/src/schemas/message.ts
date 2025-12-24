import { ObjectId } from "@fastify/mongodb";
import { z } from "zod";

export const messageSchema = z.object({
  _id: z.instanceof(ObjectId),
  senderId: z.instanceof(ObjectId),
  receiverId: z.instanceof(ObjectId),
  text: z.string().optional(),
  voice: z.object({ url: z.url(), publicId: z.string() }).optional(),
  image: z.object({ url: z.url(), publicId: z.string() }).optional(),
  status: z.enum(["sent", "delivered", "read"]),
  sentAt: z.date(),
});

export const messageWithStringIdsSchema = messageSchema.extend({
  _id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
});

export type Message = z.infer<typeof messageSchema>;
