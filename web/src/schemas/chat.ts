import { z } from "zod";

export const messageSchema = z.object({
  _id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  text: z.string().optional(),
  voice: z.object({ url: z.url(), publicId: z.string() }).optional(),
  image: z.object({ url: z.url(), publicId: z.string() }).optional(),
  status: z.enum(["sent", "delivered", "read"]),
  sentAt: z.iso.datetime(),
});

export type Message = z.infer<typeof messageSchema>;

export const chatUserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  username: z.string(),
  avatar: z.string(),
  lastSeen: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export type ChatUser = z.infer<typeof chatUserSchema>;
