import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { chatUserSchema } from "@/schemas/chat";

export const startNewChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({ receiver: chatUserSchema }),
});

export const startNewChat = async (username: string) => {
  const response = await apiClient.get(`/chats/start-new-chat/${username}`);
  const parsed = startNewChatResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
