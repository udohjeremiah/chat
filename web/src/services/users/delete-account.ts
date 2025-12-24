import { z } from "zod";
import { apiClient } from "@/lib/api-client";

export const deleteAccountResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const deleteAccount = async (userId: string) => {
  const response = await apiClient.delete(`/users/${userId}`);
  const parsed = deleteAccountResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
