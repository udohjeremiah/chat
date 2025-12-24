import { HugeiconsIcon } from "@hugeicons/react";
import { AddIcon, Message02Icon } from "@hugeicons/core-free-icons";
import type { Chat } from "@/providers/app-provider";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { useApp } from "@/providers/app-provider";
import ChatsListItem from "@/components/chats-list-item";

interface ChatsListProps {
  chats: Array<[string, Chat]>;
}

export default function ChatsList({ chats }: ChatsListProps) {
  const { app, setApp } = useApp();

  return (
    <div className="flex flex-1 overflow-y-auto py-4">
      {chats.length > 0 ? (
        <div className="flex flex-1 flex-col after:pb-4">
          {chats.map(([userId, chat]) => (
            <ChatsListItem
              key={userId}
              chat={chat}
              isActive={userId === app.activeChatUserId}
              onSelect={() =>
                setApp((prev) => ({ ...prev, activeChatUserId: userId }))
              }
            />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Message02Icon} />
            </EmptyMedia>
            <EmptyTitle>No chats yet</EmptyTitle>
            <EmptyDescription>
              You haven't started any conversations yet. Tap the{" "}
              <HugeiconsIcon
                icon={AddIcon}
                className="inline-flex size-4.5 items-center justify-center rounded-full bg-primary p-0.5 text-primary-foreground"
              />{" "}
              above to start chatting.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
