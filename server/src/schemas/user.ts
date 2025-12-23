import { ObjectId } from "@fastify/mongodb";
import { z } from "zod";

export const userSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string().min(3),
  username: z.string().min(3),
  password: z.string().min(8),
  avatar: z.string(),
  lastSeen: z.date().nullable(),
  createdAt: z.date(),
});

export const userWithStringIdsSchema = userSchema.extend({ _id: z.string() });
export const userWithoutIdSchema = userSchema.omit({ _id: true });
export const userWithoutPasswordSchema = userSchema.omit({ password: true });

export type User = z.infer<typeof userSchema>;
export type UserWithoutId = z.infer<typeof userWithoutIdSchema>;
export type UserWithoutPassword = z.infer<typeof userWithoutPasswordSchema>;
