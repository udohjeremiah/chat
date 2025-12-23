import { z } from "zod";

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  username: z.string(),
  avatar: z.string(),
  lastSeen: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export type User = z.infer<typeof userSchema>;
