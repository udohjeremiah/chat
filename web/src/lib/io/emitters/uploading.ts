import type { TypedSocket } from "..";

export const createUploadingEmitters = (socket: TypedSocket) => ({
  start: (receiverId: string) => {
    socket.emit("uploading:start", receiverId);
  },

  stop: (receiverId: string) => {
    socket.emit("uploading:stop", receiverId);
  },
});
