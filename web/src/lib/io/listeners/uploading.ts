import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handleUploadingStart = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        uploading: true,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};

export const handleUploadingStop = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        uploading: false,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};
