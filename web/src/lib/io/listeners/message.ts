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
      const isActiveChat = prev.activeChatUserId === chatUserId;

      const existingChat = prev.chatList?.[chatUserId];

      const nextChatList: NonNullable<App["chatList"]> = {
        ...(prev.chatList ?? {}),
      };

      const baseChat = existingChat ?? {
        user,
        isOnline: false,
        lastMessage: undefined,
        unreadMessages: 0,
        typing: false,
        recording: false,
        uploading: false,
      };

      nextChatList[chatUserId] = {
        ...baseChat,
        lastMessage: message,
        unreadMessages:
          isOwnMessage || isActiveChat ? 0 : baseChat.unreadMessages + 1,
      };

      const nextChat: NonNullable<App["chat"]> = {
        ...(prev.chat ?? {}),
        [chatUserId]: [...(prev.chat?.[chatUserId] ?? []), message],
      };

      if (!existingChat) socket.emit("presence:get", chatUserId);
      if (!isOwnMessage && isActiveChat) {
        socket.emit("message:read", chatUserId);
      }

      return { ...prev, chatList: nextChatList, chat: nextChat };
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
      const existingChat = prev.chatList?.[userId];
      if (!existingChat) return prev;

      const lastMessage = existingChat.lastMessage;

      const nextChatList: NonNullable<App["chatList"]> = {
        ...prev.chatList,
        [userId]: lastMessage
          ? {
              ...existingChat,
              lastMessage: { ...lastMessage, status },
              unreadMessages:
                status === "read" ? 0 : existingChat.unreadMessages,
            }
          : existingChat,
      };

      const nextChat: NonNullable<App["chat"]> = {
        ...(prev.chat ?? {}),
        [userId]: (prev.chat?.[userId] ?? []).map((msg) =>
          STATUS[msg.status] < STATUS[status] ? { ...msg, status } : msg,
        ),
      };

      return { ...prev, chatList: nextChatList, chat: nextChat };
    });
  };

  return handler;
};
