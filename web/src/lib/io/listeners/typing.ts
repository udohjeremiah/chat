import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handleTypingStart = (setApp: Dispatch<SetStateAction<App>>) => {
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
            typing: true,
          },
        },
      };
    });
  };

  return handler;
};

export const handleTypingStop = (setApp: Dispatch<SetStateAction<App>>) => {
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
            typing: false,
          },
        },
      };
    });
  };

  return handler;
};
