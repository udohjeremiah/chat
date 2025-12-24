import { io } from "socket.io-client";
import { handleMessageSent, handleMessagesUpdate } from "./listeners/message";
import {
  handleRecordingStart,
  handleRecordingStop,
} from "./listeners/recording";
import {
  handlePresenceOff,
  handlePresenceOn,
  handlePresenceUser,
  handlePresenceUsers,
} from "./listeners/presence";
import { handleTypingStart, handleTypingStop } from "./listeners/typing";
import { createPresenceEmitters } from "./emitters/presence";
import { createRecordingEmitters } from "./emitters/recording";
import { createTypingEmitters } from "./emitters/typing";
import { createUploadingEmitters } from "./emitters/uploading";
import {
  handleUploadingStart,
  handleUploadingStop,
} from "./listeners/uploading";
import { createMessageEmitters } from "./emitters/message";
import { handleConnect, handleDisconnect } from "./listeners/connection";
import type { Socket } from "socket.io-client";
import type { Dispatch, SetStateAction } from "react";
import type { App } from "@/providers/app-provider";
import type { ChatUser, Message } from "@/schemas/chat";
import { env } from "@/env";

/**
 * Events sent from server to client
 */
interface ServerToClientEvents {
  "presence:users": (onlineUserIds: Array<string>) => void;
  "presence:user": (payload: { userId: string; isOnline: boolean }) => void;
  "presence:on": (userId: string) => void;
  "presence:off": (userId: string) => void;

  "typing:start": (userId: string) => void;
  "typing:stop": (userId: string) => void;

  "recording:start": (userId: string) => void;
  "recording:stop": (userId: string) => void;

  "uploading:start": (userId: string) => void;
  "uploading:stop": (userId: string) => void;

  "message:sent": (payload: { user: ChatUser; message: Message }) => void;
  "message:delivered": (userId: string) => void;
  "message:read": (userId: string) => void;
}

/**
 * Events sent from client to server
 */
interface ClientToServerEvents {
  "presence:getAll": () => void;
  "presence:get": (targetUserId: string) => void;
  "presence:on": () => void;
  "presence:off": () => void;

  "typing:start": (receiverId: string) => void;
  "typing:stop": (receiverId: string) => void;

  "recording:start": (receiverId: string) => void;
  "recording:stop": (receiverId: string) => void;

  "uploading:start": (receiverId: string) => void;
  "uploading:stop": (receiverId: string) => void;

  "message:send": (payload: {
    receiverId: string;
    text?: string;
    voice?: { url: string; publicId: string };
    image?: { url: string; publicId: string };
  }) => void;
  "message:read": (receiverId: string) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const ioClient = (): TypedSocket => {
  return io(env.VITE_SERVER_URL, {
    auth: { jwt: localStorage.getItem("jwt") },
  });
};

export const registerListeners = (
  socket: TypedSocket,
  setApp: Dispatch<SetStateAction<App>>,
) => {
  socket.on("connect", handleConnect(socket));
  socket.on("disconnect", handleDisconnect(setApp));

  socket.on("presence:users", handlePresenceUsers(setApp));
  socket.on("presence:user", handlePresenceUser(setApp));
  socket.on("presence:on", handlePresenceOn(setApp));
  socket.on("presence:off", handlePresenceOff(setApp));

  socket.on("typing:start", handleTypingStart(setApp));
  socket.on("typing:stop", handleTypingStop(setApp));

  socket.on("recording:start", handleRecordingStart(setApp));
  socket.on("recording:stop", handleRecordingStop(setApp));

  socket.on("uploading:start", handleUploadingStart(setApp));
  socket.on("uploading:stop", handleUploadingStop(setApp));

  socket.on("message:sent", handleMessageSent(socket, setApp));
  socket.on("message:delivered", handleMessagesUpdate(setApp, "delivered"));
  socket.on("message:read", handleMessagesUpdate(setApp, "read"));
};

export const createEmitters = (socket: TypedSocket) => {
  return {
    presence: createPresenceEmitters(socket),
    typing: createTypingEmitters(socket),
    recording: createRecordingEmitters(socket),
    uploading: createUploadingEmitters(socket),
    message: createMessageEmitters(socket),
  };
};

export type Emitters = ReturnType<typeof createEmitters>;
