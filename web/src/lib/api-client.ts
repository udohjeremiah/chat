import axios from "axios";
import { env } from "@/env";

export const apiClient = axios.create({
  baseURL: env.VITE_SERVER_API_URL,
  headers: { "Content-Type": "application/json" },
});
