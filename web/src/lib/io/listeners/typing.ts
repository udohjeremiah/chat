import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handleTypingStart = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        typing: true,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};

export const handleTypingStop = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        typing: false,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};
