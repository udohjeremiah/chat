import { z } from "zod";
import { apiClient } from "@/lib/api-client";

export const deleteChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const deleteChat = async (userId: string) => {
  const response = await apiClient.delete(`/chats/${userId}/messages`);
  const parsed = deleteChatResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
