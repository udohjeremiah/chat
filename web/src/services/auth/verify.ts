import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { userSchema } from "@/schemas/user";

export const verifyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({ user: userSchema.optional() }),
});

export const verify = async (token: string) => {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const response = await apiClient.get("/auth/verify");
  const parsed = verifyResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
