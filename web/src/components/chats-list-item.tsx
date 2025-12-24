import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { CameraIcon, Mic02Icon } from "@hugeicons/core-free-icons";
import type { Chat } from "@/providers/app-provider";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import AvatarWithPresence from "@/components/avatar-with-presence";

interface ChatsListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
}

export default function ChatsListItem({
  chat,
  isActive,
  onSelect,
}: ChatsListItemProps) {
  const lastSeen = chat.user.lastSeen
    ? formatDistanceToNow(new Date(chat.user.lastSeen), { addSuffix: true })
    : undefined;

  const joined = formatDistanceToNow(new Date(chat.user.createdAt), {
    addSuffix: true,
  });

  let lastMessageDisplay: ReactNode = undefined;
  if (chat.lastMessage) {
    if (chat.lastMessage.text) {
      lastMessageDisplay =
        chat.lastMessage.text.length > 40
          ? chat.lastMessage.text.slice(0, 40) + "..."
          : chat.lastMessage.text;
    } else if (chat.lastMessage.voice) {
      lastMessageDisplay = (
        <span className="flex items-center gap-1">
          <HugeiconsIcon icon={Mic02Icon} className="size-4 text-primary" />
          Voice message
        </span>
      );
    } else if (chat.lastMessage.image) {
      lastMessageDisplay = (
        <span className="flex items-center gap-1">
          <HugeiconsIcon icon={CameraIcon} className="size-4 text-primary" />
          Photo
        </span>
      );
    }
  }

  const info = chat.typing
    ? "typing..."
    : chat.recording
      ? "recording audio..."
      : chat.uploading
        ? "uploading image..."
        : chat.lastMessage
          ? lastMessageDisplay
          : chat.isOnline
            ? "Online"
            : lastSeen
              ? `Last seen ${lastSeen}`
              : `Joined ${joined}`;

  const unreadCount = chat.unreadMessages > 100 ? "100+" : chat.unreadMessages;

  return (
    <div aria-current={isActive ? "true" : undefined} className="relative">
      <span
        aria-hidden={true}
        className={cn(
          "absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />
      <Button
        variant="ghost"
        className="size-full rounded-none px-4 py-2"
        onClick={onSelect}
      >
        <AvatarWithPresence
          src={chat.user.avatar}
          name={chat.user.name}
          status={chat.isOnline ? "online" : "offline"}
        />
        <div className="flex flex-1 flex-col items-start gap-0.5">
          <span className="leading-none">{chat.user.name}</span>
          <span className="text-xs leading-none text-muted-foreground">
            {info}
          </span>
        </div>
        {chat.unreadMessages > 0 && (
          <Badge
            aria-label={
              chat.unreadMessages > 100
                ? "More than 100 unread messages"
                : `${chat.unreadMessages} unread messages`
            }
            className="ml-auto h-5 min-w-5 rounded-full px-1 text-xs tabular-nums"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
