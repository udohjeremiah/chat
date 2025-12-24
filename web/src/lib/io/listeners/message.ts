import type { App } from "@/providers/app-provider";
import type { ChatUser, Message } from "@/schemas/chat";
import type { Dispatch, SetStateAction } from "react";
import type { TypedSocket } from "..";

export const handleMessageSent = (
  socket: TypedSocket,
  setApp: Dispatch<SetStateAction<App>>,
) => {
  const handler = ({ user, message }: { user: ChatUser; message: Message }) => {
    const chatUserId = user._id;

    setApp((prev) => {
      const isOwnMessage = message.senderId === prev.user?._id;
      const isOldChat = !!prev.chatList?.[chatUserId];
      const isActiveChat = prev.activeChatUserId === chatUserId;

      const chatList = { ...prev.chatList };
      const chat = { ...prev.chat };

      if (!isOldChat) {
        chatList[chatUserId] = {
          user,
          isOnline: false,
          lastMessage: undefined,
          unreadMessages: 0,
          typing: false,
          recording: false,
          uploading: false,
        };
      }

      chatList[chatUserId] = {
        ...chatList[chatUserId],
        lastMessage: message,
        unreadMessages:
          isOwnMessage || isActiveChat
            ? 0
            : chatList[chatUserId].unreadMessages + 1,
      };

      chat[chatUserId] = [...(chat[chatUserId] ?? []), message];

      if (!isOldChat) socket.emit("presence:get", chatUserId);
      if (!isOwnMessage && isActiveChat) {
        socket.emit("message:read", chatUserId);
      }

      return { ...prev, chatList, chat };
    });
  };

  return handler;
};

export const handleMessagesUpdate = (
  setApp: Dispatch<SetStateAction<App>>,
  status: "delivered" | "read",
) => {
  const STATUS = {
    sent: 0,
    delivered: 1,
    read: 2,
  } as const;

  const handler = (userId: string) => {
    setApp((prev) => {
      if (!prev.chatList?.[userId]) return prev;

      const chatList = { ...prev.chatList };
      const chat = { ...prev.chat };

      const lastMessage = chatList[userId].lastMessage;
      if (lastMessage) {
        chatList[userId] = {
          ...chatList[userId],
          lastMessage: { ...lastMessage, status },
          unreadMessages:
            status === "read" ? 0 : chatList[userId].unreadMessages,
        };
      }

      chat[userId] = [
        ...(chat[userId] ?? []).map((msg) =>
          STATUS[msg.status] < STATUS[status] ? { ...msg, status } : msg,
        ),
      ];

      return { ...prev, chatList, chat };
    });
  };

  return handler;
};
