import type { TypedSocket } from "..";

export const createRecordingEmitters = (socket: TypedSocket) => ({
  start: (receiverId: string) => {
    socket.emit("recording:start", receiverId);
  },

  stop: (receiverId: string) => {
    socket.emit("recording:stop", receiverId);
  },
});
