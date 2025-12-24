import type { App } from "@/providers/app-provider";
import type { Dispatch, SetStateAction } from "react";
import type { TypedSocket } from "..";

export const handleConnect = (socket: TypedSocket) => {
  const handler = () => {
    socket.emit("presence:getAll");
  };

  return handler;
};

export const handleDisconnect = (setApp: Dispatch<SetStateAction<App>>) => {
  const handler = () => {
    setApp((prev) => ({
      ...prev,
      chatList: Object.fromEntries(
        Object.entries(prev.chatList ?? {}).map(([userId, chat]) => [
          userId,
          {
            ...chat,
            isOnline: false,
            typing: false,
            recording: false,
            uploading: false,
          },
        ]),
      ),
    }));
  };

  return handler;
};
