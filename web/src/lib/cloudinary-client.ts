import axios from "axios";
import { env } from "@/env";

export const cloudinaryClient = axios.create({
  baseURL: `${env.VITE_CLOUDINARY_UPLOAD_URL}/${env.VITE_CLOUDINARY_CLOUD_NAME}`,
  headers: { "Content-Type": "multipart/form-data" },
});
