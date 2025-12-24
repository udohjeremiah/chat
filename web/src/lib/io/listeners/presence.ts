import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";

export const handlePresenceUsers = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (onlineUserIds: string[]) => {
    setApp((prev) => {
      if (!prev.chatList) return prev;

      const nextChatList: NonNullable<App["chatList"]> = {};

      for (const [userId, existingChat] of Object.entries(prev.chatList)) {
        nextChatList[userId] = {
          ...existingChat,
          isOnline: onlineUserIds.includes(userId),
        };
      }

      return { ...prev, chatList: nextChatList };
    });
  };

  return handler;
};

export const handlePresenceUser = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = (payload: { userId: string; isOnline: boolean }) => {
    const { userId, isOnline } = payload;

    setApp((prev) => {
      const existingChat = prev.chatList?.[userId];
      if (!existingChat) return prev;

      return {
        ...prev,
        chatList: {
          ...prev.chatList,
          [userId]: {
            ...existingChat,
            isOnline,
          },
        },
      };
    });
  };

  return handler;
};

export const handlePresenceOn = (setApp: Dispatch<SetStateAction<App>>) => {
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
            isOnline: true,
          },
        },
      };
    });
  };

  return handler;
};

export const handlePresenceOff = (setApp: Dispatch<SetStateAction<App>>) => {
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
            isOnline: false,
          },
        },
      };
    });
  };

  return handler;
};
