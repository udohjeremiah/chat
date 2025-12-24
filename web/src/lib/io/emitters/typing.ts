import type { TypedSocket } from "..";

export const createTypingEmitters = (socket: TypedSocket) => ({
  start: (receiverId: string) => {
    socket.emit("typing:start", receiverId);
  },

  stop: (receiverId: string) => {
    socket.emit("typing:stop", receiverId);
  },
});
