import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { chatUserSchema, messageSchema } from "@/schemas/chat";

export const getChatsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    chats: z.array(
      z.object({
        user: chatUserSchema,
        lastMessage: messageSchema,
        unreadMessages: z.number(),
      }),
    ),
  }),
});

export const getChats = async () => {
  const response = await apiClient.get("/chats");
  const parsed = getChatsResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
