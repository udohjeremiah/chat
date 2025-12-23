import { z } from "zod";
import { apiClient } from "@/lib/api-client";

export const signInResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    token: z.string(),
  }),
});

export const signIn = async (values: {
  username: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/signin", values);
  const parsed = signInResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
