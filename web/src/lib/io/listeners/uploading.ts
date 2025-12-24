import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handleUploadingStart = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      const existingChat = prev.chatList?.[userId];
      if (!existingChat) return prev;

      return {
        ...prev,
        chatList: {
          ...prev.chatList,
          [userId]: {
            ...existingChat,
            uploading: true,
          },
        },
      };
    });
  };

  return handler;
};

export const handleUploadingStop = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      const existingChat = prev.chatList?.[userId];
      if (!existingChat) return prev;

      return {
        ...prev,
        chatList: {
          ...prev.chatList,
          [userId]: {
            ...existingChat,
            uploading: false,
          },
        },
      };
    });
  };

  return handler;
};
