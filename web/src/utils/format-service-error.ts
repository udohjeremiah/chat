import { AxiosError } from "axios";

export function formatServiceError(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? "Unknown error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred";
}
