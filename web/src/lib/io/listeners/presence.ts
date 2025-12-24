import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handlePresenceUsers = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (onlineUserIds: Array<string>) => {
    setApp((prev) => {
      if (!prev.chatList) return prev;

      const chatList = { ...prev.chatList };

      for (const userId in chatList) {
        chatList[userId] = {
          ...chatList[userId],
          isOnline: onlineUserIds.includes(userId),
        };
      }

      return { ...prev, chatList };
    });
  };

  return handler;
};

export const handlePresenceUser = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (payload: { userId: string; isOnline: boolean }) => {
    const { userId, isOnline } = payload;

    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        isOnline,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};

export const handlePresenceOn = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        isOnline: true,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};

export const handlePresenceOff = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      chatList[userId] = {
        ...chatList[userId],
        isOnline: false,
      };

      return { ...prev, chatList };
    });
  };

  return handler;
};
