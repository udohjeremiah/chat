import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handleRecordingStart = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        recording: true,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};

export const handleRecordingStop = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        recording: false,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};
