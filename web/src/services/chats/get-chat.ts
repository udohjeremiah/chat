import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { messageSchema } from "@/schemas/chat";

export const getChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({ chat: z.array(messageSchema) }),
});

export const getChat = async (userId: string) => {
  const response = await apiClient.get(`/chats/${userId}/messages`);
  const parsed = getChatResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
