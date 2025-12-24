import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handleRecordingStart = (setApp: Dispatch<SetStateAction<App>>) => {
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
            recording: true,
          },
        },
      };
    });
  };

  return handler;
};

export const handleRecordingStop = (setApp: Dispatch<SetStateAction<App>>) => {
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
            recording: false,
          },
        },
      };
    });
  };

  return handler;
};
