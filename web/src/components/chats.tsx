import { useMemo, useState } from "react";
import { useDebounce, useMediaQuery } from "@uidotdev/usehooks";
import ChatsFooter from "@/components/chats-footer";
import ChatsHeader from "@/components/chats-header";

import { useApp } from "@/providers/app-provider";
import ChatsList from "@/components/chats-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function Chats() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);
  const { app } = useApp();

  const filteredChats = useMemo(() => {
    const chats = Object.entries(app.chatList ?? {});

    const filtered = debouncedSearchText
      ? chats.filter(([_, chat]) =>
          chat.user.name
            .toLowerCase()
            .includes(debouncedSearchText.toLowerCase()),
        )
      : chats;

    return filtered.sort(([_, chatA], [__, chatB]) => {
      const timeA = chatA.lastMessage?.sentAt
        ? new Date(chatA.lastMessage.sentAt).getTime()
        : 0;
      const timeB = chatB.lastMessage?.sentAt
        ? new Date(chatB.lastMessage.sentAt).getTime()
        : 0;
      return timeB - timeA;
    });
  }, [app.chatList, debouncedSearchText]);

  if (app.activeChatUserId && !isDesktop) return;

  if (!app.chatList) {
    return (
      <div className="flex size-full basis-4/12 flex-col">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="size-7 rounded-full" />
        </div>
        <div className="flex flex-1 overflow-y-auto p-4">
          <div className="flex flex-1 flex-col gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex flex-col gap-0.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="size-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t px-4 py-2">
          <div className="flex items-center justify-between gap-2 rounded-md border px-4 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="size-7 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-full basis-4/12 flex-col">
      <ChatsHeader
        searchText={searchText}
        setSearchText={setSearchText}
        chatsLength={filteredChats.length}
      />
      <ChatsList chats={filteredChats} />
      <ChatsFooter />
    </div>
  );
}
