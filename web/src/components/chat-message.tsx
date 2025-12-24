import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckCheck,
  Check,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import type WaveSurfer from "wavesurfer.js";
import type { Message } from "@/schemas/chat";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/utils/cn";
import { useApp } from "@/providers/app-provider";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const { app } = useApp();

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
  };

  const isMe = message.senderId === app.user?._id;

  return (
    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-9/12 rounded-lg text-sm",
          isMe
            ? "rounded-br-xs bg-primary text-primary-foreground"
            : "rounded-bl-xs bg-card text-card-foreground",
        )}
      >
        {message.text ? (
          <p className="px-2 pt-1 wrap-break-word whitespace-pre-wrap">
            {message.text}
          </p>
        ) : message.voice ? (
          <div className="flex items-center justify-center gap-1 px-2 pt-1">
            <button
              className="flex size-8 items-center justify-center rounded-full bg-black/10"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <HugeiconsIcon icon={PauseIcon} className="size-4" />
              ) : (
                <HugeiconsIcon icon={PlayIcon} className="size-4" />
              )}
            </button>
            <WavesurferPlayer
              height={32}
              width={175}
              barWidth={2}
              barGap={2}
              cursorWidth={0}
              waveColor={isMe ? "#fafafa" : "#e5e7eb"}
              progressColor={isMe ? "#22c55e" : "#6b7280"}
              url={message.voice.url}
              onReady={onReady}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onFinish={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <img
            src={message.image?.url}
            alt="Sent image"
            className="size-20 rounded-t-lg object-cover p-0.5"
            loading="lazy"
            onClick={() => setOpenImage(true)}
          />
        )}
        <div
          className={cn(
            "flex items-center gap-1 px-2 pb-1 text-[10px]",
            isMe ? "justify-end" : "justify-start",
          )}
        >
          <time dateTime={message.sentAt} className="opacity-70">
            {format(new Date(message.sentAt), "HH:mm")}
          </time>
          {isMe &&
            (message.status === "sent" ? (
              <HugeiconsIcon icon={Check} className="size-3.5 opacity-70" />
            ) : message.status === "delivered" ? (
              <HugeiconsIcon
                icon={CheckCheck}
                className="size-3.5 opacity-70"
              />
            ) : (
              <HugeiconsIcon
                icon={CheckCheck}
                className="size-3.5 text-cyan-400"
              />
            ))}
        </div>
      </div>
      <Dialog open={openImage} onOpenChange={setOpenImage}>
        <DialogContent className="h-screen max-w-screen place-items-center rounded-none px-0">
          <DialogTitle className="sr-only">
            Viewing image in fullscreen
          </DialogTitle>
          <img
            src={message.image?.url}
            alt=""
            className="size-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
