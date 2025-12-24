import fp from "fastify-plugin";
import { Server, type ServerOptions, Socket } from "socket.io";

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

/**
 * Events sent from server to client
 */
export interface ServerToClientEvents {
  "presence:users": (onlineUserIds: Array<string>) => void;
  "presence:user": (payload: unknown) => void;
  "presence:on": (userId: string) => void;
  "presence:off": (userId: string) => void;

  "typing:start": (userId: string) => void;
  "typing:stop": (userId: string) => void;

  "recording:start": (userId: string) => void;
  "recording:stop": (userId: string) => void;

  "uploading:start": (userId: string) => void;
  "uploading:stop": (userId: string) => void;

  "message:sent": (payload: unknown) => void;
  "message:delivered": (userId: string) => void;
  "message:read": (userId: string) => void;
}

/**
 * Optional per-socket data
 */
interface SocketData {
  userId?: string;
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

declare module "fastify" {
  interface FastifyInstance {
    io: Server<
      ClientToServerEvents,
      ServerToClientEvents,
      Record<string, never>,
      SocketData
    >;
  }
}

export type IOOptions = Partial<ServerOptions> & {
  preClose?: (done: () => void) => void;
};

/**
 * This plugin enables the use of socket.io.
 *
 * @see {@link https://github.com/ducktors/fastify-socket.io}
 */
export default fp<IOOptions>(
  async (fastify, options) => {
    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      Record<string, never>,
      SocketData
    >(fastify.server, {
      cors: {
        origin:
          fastify.env.NODE_ENV === "production" ? fastify.env.CLIENT_URL : "*",
      },
      ...options,
    });

    fastify.decorate("io", io);

    fastify.addHook("preClose", (done) => {
      if (options.preClose) return options.preClose(done);
      fastify.io.local.disconnectSockets(true);
      done();
    });

    fastify.addHook("onClose", (instance, done) => {
      instance.io.close();
      done();
    });
  },
  { name: "io" },
);
