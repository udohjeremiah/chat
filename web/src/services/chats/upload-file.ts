import { z } from "zod";
import { apiClient } from "@/lib/api-client";

export const uploadFileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({ url: z.url(), publicId: z.string() }),
});

export const uploadFile = async (body: FormData) => {
  const response = await apiClient.post("/chats/upload-file", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const parsed = uploadFileResponseSchema.parse(response.data);

  if (!parsed.success) throw new Error(parsed.message);
  return parsed;
};
