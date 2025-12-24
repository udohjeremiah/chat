import type { TypedSocket } from "..";

export const createPresenceEmitters = (socket: TypedSocket) => ({
  getAll: () => {
    socket.emit("presence:getAll");
  },

  get: (targetUserId: string) => {
    socket.emit("presence:get", targetUserId);
  },

  on: () => {
    socket.emit("presence:on");
  },

  off: () => {
    socket.emit("presence:off");
  },
});
