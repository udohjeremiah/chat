import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeft, Info } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/app-provider";
import AvatarWithPresence from "@/components/avatar-with-presence";
import { formatServiceError } from "@/utils/format-service-error";
import { deleteChat } from "@/services/chats/delete-chat";

export default function ChatHeader() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { app, setApp } = useApp();

  const chat = app.chatList?.[app.activeChatUserId ?? ""];
  if (!chat) return;

  const lastSeen = chat.user.lastSeen
    ? formatDistanceToNow(new Date(chat.user.lastSeen), {
        addSuffix: true,
      })
    : undefined;

  const joined = formatDistanceToNow(new Date(chat.user.createdAt), {
    addSuffix: true,
  });

  const info = chat.typing
    ? "typing..."
    : chat.recording
      ? "recording audio..."
      : chat.uploading
        ? "uploading image..."
        : chat.isOnline
          ? "Online"
          : lastSeen
            ? `Last seen ${lastSeen}`
            : `Joined ${joined}`;

  const handleDeleteChat = async () => {
    if (!app.activeChatUserId || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteChat(app.activeChatUserId);
      router.navigate({ to: "/", reloadDocument: true });
    } catch (error) {
      console.error(formatServiceError(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full border-b">
      <div className="flex w-full items-center justify-between gap-1 px-2 py-4 lg:px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground lg:hidden"
          onClick={() =>
            setApp((prev) => ({ ...prev, activeChatUserId: undefined }))
          }
        >
          <HugeiconsIcon icon={ChevronLeft} />
        </Button>
        <div className="flex flex-1 items-center gap-2 font-medium">
          <AvatarWithPresence
            src={chat.user.avatar}
            name={chat.user.name}
            status={chat.isOnline ? "online" : "offline"}
          />
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm leading-none">
              {chat.user.name}
            </span>
            <span className="truncate text-xs leading-none text-muted-foreground">
              {info}
            </span>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <HugeiconsIcon icon={Info} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AvatarWithPresence
                src={chat.user.avatar}
                name={chat.user.name}
                status={chat.isOnline ? "online" : "offline"}
              />
              <div className="flex flex-col gap-0.5 text-sm font-medium">
                <span className="truncate leading-none">{chat.user.name}</span>
                <span className="truncate leading-none text-muted-foreground">
                  @{chat.user.username}
                </span>
              </div>
            </div>
            <p className="flex items-center gap-2 text-sm font-medium">
              Joined {joined}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setAlertOpen(true)}
            >
              Delete chat
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              chat and all associated messages from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              variant="destructive"
              onClick={handleDeleteChat}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
