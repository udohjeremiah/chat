import { z } from "zod";
import { apiClient } from "@/lib/api-client";

export const signUpResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const signUp = async (values: {
  name: string;
  username: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/signup", values);
  const parsed = signUpResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
