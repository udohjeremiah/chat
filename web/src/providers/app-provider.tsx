import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouteContext } from "@tanstack/react-router";
import { useDebounce, useNetworkState } from "@uidotdev/usehooks";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { User } from "@/schemas/user";
import type { Emitters, TypedSocket } from "@/lib/io";
import type { ChatUser, Message } from "@/schemas/chat";
import { createEmitters, ioClient, registerListeners } from "@/lib/io";
import { formatServiceError } from "@/utils/format-service-error";
import { getChats } from "@/services/chats/get-chats";
import { getChat } from "@/services/chats/get-chat";

export type Chat = {
  user: ChatUser;
  isOnline: boolean;
  lastMessage?: Message;
  unreadMessages: number;
  typing: boolean;
  recording: boolean;
  uploading: boolean;
};

export type App = {
  user?: User;
  chatList?: Record<string, Chat>;
  chatLoaded?: Record<string, boolean>;
  chat?: Record<string, Array<Message>>;
  activeChatUserId?: string;
};

interface AppContextType {
  app: App;
  setApp: Dispatch<SetStateAction<App>>;
  emit: Emitters;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const network = useNetworkState();
  const debouncedOnline = useDebounce(network.online, 1000);
  const { user: initialUser } = useRouteContext({ from: "__root__" });

  const [app, setApp] = useState<App>({
    user: initialUser,
    chatList: undefined,
    chatLoaded: undefined,
    chat: undefined,
    activeChatUserId: undefined,
  });

  const socketRef = useRef<TypedSocket | undefined>(undefined);
  const emittersRef = useRef<Emitters | undefined>(undefined);

  // Initialize socket and listeners
  useEffect(() => {
    if (!app.user) return;

    const socket = ioClient();
    socketRef.current = socket;
    registerListeners(socket, setApp);
    emittersRef.current = createEmitters(socket);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = undefined;
      emittersRef.current = undefined;
    };
  }, [app.user]);

  // Fetch initial chat list
  useEffect(() => {
    const fetchChats = async () => {
      if (!app.user) return;

      try {
        const result = await getChats();

        const chatList: Record<string, Chat> = {};
        for (const chat of result.data.chats) {
          chatList[chat.user._id] = {
            user: chat.user,
            isOnline: false,
            lastMessage: chat.lastMessage,
            unreadMessages: chat.unreadMessages,
            typing: false,
            recording: false,
            uploading: false,
          };
        }

        setApp((prev) => ({ ...prev, chatList }));
        emittersRef.current?.presence.getAll();
      } catch (error) {
        console.error(formatServiceError(error));
      }
    };

    fetchChats();
  }, [app.user]);

  // Fetch chat for active user
  useEffect(() => {
    const fetchChat = async () => {
      const userId = app.activeChatUserId;
      if (!userId || !app.chatList?.[userId] || app.chatLoaded?.[userId]) {
        return;
      }

      try {
        const result = await getChat(userId);

        setApp((prev) => {
          const existingChat = prev.chatList?.[userId];
          if (!existingChat) return prev;

          return {
            ...prev,
            chatList: {
              ...prev.chatList,
              [userId]: {
                ...existingChat,
                lastMessage: result.data.chat.at(-1),
                unreadMessages: 0,
              },
            },
            chatLoaded: {
              ...prev.chatLoaded,
              [userId]: true,
            },
            chat: {
              ...prev.chat,
              [userId]: result.data.chat,
            },
          };
        });
      } catch (error) {
        console.error(formatServiceError(error));
      }
    };

    fetchChat();
  }, [app.activeChatUserId, app.chatList, app.chatLoaded]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (!app.activeChatUserId || !app.chat) return;

    const userId = app.activeChatUserId;
    const chatMessages = app.chat[userId];
    if (chatMessages?.length === 0) return;

    const hasUnread = chatMessages?.some(
      (msg) => msg.senderId === userId && msg.status !== "read",
    );
    if (hasUnread) emittersRef.current?.message.read(userId);
  }, [app.activeChatUserId, app.chat]);

  // Debounced network presence
  useEffect(() => {
    if (!app.user) return;

    if (debouncedOnline) {
      emittersRef.current?.presence.on();
    } else {
      emittersRef.current?.presence.off();
    }
  }, [app.user, debouncedOnline]);

  // Stable emitters proxy
  const emit = useMemo<Emitters>(
    () => ({
      presence: {
        getAll: () => emittersRef.current?.presence.getAll(),
        get: (id) => emittersRef.current?.presence.get(id),
        on: () => emittersRef.current?.presence.on(),
        off: () => emittersRef.current?.presence.off(),
      },
      typing: {
        start: (id) => emittersRef.current?.typing.start(id),
        stop: (id) => emittersRef.current?.typing.stop(id),
      },
      recording: {
        start: (id) => emittersRef.current?.recording.start(id),
        stop: (id) => emittersRef.current?.recording.stop(id),
      },
      uploading: {
        start: (id) => emittersRef.current?.uploading.start(id),
        stop: (id) => emittersRef.current?.uploading.stop(id),
      },
      message: {
        send: (msg) => emittersRef.current?.message.send(msg),
        read: (id) => emittersRef.current?.message.read(id),
      },
    }),
    [],
  );

  const value = useMemo(() => ({ app, setApp, emit }), [app, emit]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
