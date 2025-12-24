import ChatSendMessage from "@/components/chat-send-message";
import ChatHeader from "@/components/chat-header";
import ChatMessages from "@/components/chat-messages";
import { useApp } from "@/providers/app-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function Chat() {
  const { app } = useApp();

  if (!app.activeChatUserId) {
    return (
      <div className="flex flex-1 border-l max-lg:hidden">
        <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
          <img
            src="/logo.svg"
            alt="Logo"
            width={24}
            height={24}
            className="size-40"
          />
          <p className="text-center text-xl font-black">
            Conversations move the world...
          </p>
        </div>
      </div>
    );
  }

  if (
    !app.chatLoaded?.[app.activeChatUserId] ||
    !app.chat?.[app.activeChatUserId]
  ) {
    return (
      <div className="flex h-full flex-1 flex-col border-l">
        <div className="flex items-center justify-between gap-1 border-b px-2 py-4 lg:px-4">
          <Skeleton className="size-5 rounded-full lg:hidden" />
          <div className="flex flex-1 items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-0.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="size-7 rounded-full" />
        </div>
        <div className="flex flex-1 overflow-y-auto p-4"></div>
        <div className="border-t px-4 py-2">
          <div className="flex items-center gap-2 p-4">
            <Skeleton className="size-7 w-full rounded-md" />
            <Skeleton className="size-7 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col border-l">
      <ChatHeader />
      <ChatMessages />
      <ChatSendMessage />
    </div>
  );
}
