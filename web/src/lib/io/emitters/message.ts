import type { TypedSocket } from "..";

export const createMessageEmitters = (socket: TypedSocket) => ({
  send: (payload: {
    receiverId: string;
    text?: string;
    voice?: { url: string; publicId: string };
    image?: { url: string; publicId: string };
  }) => {
    socket.emit("message:send", payload);
  },

  read: (receiverId: string) => {
    socket.emit("message:read", receiverId);
  },
});
