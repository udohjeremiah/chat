import { env } from "@/env";
import { cloudinaryClient } from "@/lib/cloudinary-client";

export async function uploadToCloudinary(file: Blob | File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const res = await cloudinaryClient.post("/auto/upload", formData);

  return {
    url: res.data.secure_url as string,
    publicId: res.data.public_id as string,
  };
}
