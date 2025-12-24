import { HugeiconsIcon } from "@hugeicons/react";
import { CameraIcon, Mic02Icon } from "@hugeicons/core-free-icons";
import { useApp } from "@/providers/app-provider";

export default function MessageIndicator() {
  const { app } = useApp();

  if (!app.activeChatUserId) return;

  const chat = app.chatList?.[app.activeChatUserId];
  if (!chat || (!chat.typing && !chat.recording && !chat.uploading)) return;

  return (
    <div className="w-fit rounded-lg rounded-bl-xs bg-card p-1 px-2 text-muted-foreground">
      {chat.typing ? (
        <div className="flex items-center gap-1 py-1">
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground delay-150" />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground delay-300" />
        </div>
      ) : chat.recording ? (
        <HugeiconsIcon icon={Mic02Icon} className="size-4 animate-pulse" />
      ) : chat.uploading ? (
        <HugeiconsIcon icon={CameraIcon} className="size-4 animate-pulse" />
      ) : undefined}
    </div>
  );
}
