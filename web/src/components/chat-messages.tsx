import { HugeiconsIcon } from "@hugeicons/react";
import { Message02Icon } from "@hugeicons/core-free-icons";
import { Fragment, useEffect, useRef } from "react";
import { isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import ChatMessage from "@/components/chat-message";
import { useApp } from "@/providers/app-provider";
import MessageIndicator from "@/components/message-indicator";
import { getDateLabel } from "@/utils/get-date-label";

export default function ChatMessages() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { app } = useApp();

  const isChatLoaded = app.chatLoaded?.[app.activeChatUserId ?? ""];
  const messages = app.chat?.[app.activeChatUserId ?? ""];

  useEffect(() => {
    if (messages?.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  if (!isChatLoaded || !messages) return;

  return (
    <div className="flex flex-1 overflow-y-auto p-4">
      {messages.length > 0 ? (
        <div className="flex flex-1 flex-col gap-1">
          {messages.map((message, index) => {
            const currentDate = new Date(message.sentAt);
            const prevMessage = messages[index - 1];
            const showDateSeparator =
              index === 0 ||
              !prevMessage ||
              !isSameDay(
                new Date(message.sentAt),
                new Date(prevMessage.sentAt),
              );

            return (
              <Fragment key={message._id}>
                {showDateSeparator && (
                  <Badge variant="outline" className="self-center">
                    {getDateLabel(currentDate)}
                  </Badge>
                )}
                <ChatMessage message={message} />
              </Fragment>
            );
          })}
          <MessageIndicator />
          <div ref={bottomRef} className="pb-4" />
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Message02Icon} />
            </EmptyMedia>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>
              Start the conversation by sending your first message.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
