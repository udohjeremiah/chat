import { HugeiconsIcon } from "@hugeicons/react";
import {
  CameraIcon,
  CirclePause,
  Mic02Icon,
  SentIcon,
  Trash2,
} from "@hugeicons/core-free-icons";
import TextareaAutosize from "react-textarea-autosize";
import { useCallback, useEffect, useRef, useState } from "react";
import { VoiceVisualizer, useVoiceVisualizer } from "react-voice-visualizer";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/app-provider";
import { uploadToCloudinary } from "@/services/chats/upload-to-cloudinary";

export default function ChatSendMessage() {
  const [text, setText] = useState("");
  const debouncedText = useDebounce(text, 300);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef(false);
  const { app, emit } = useApp();

  const receiverId = app.activeChatUserId;

  const recorderControls = useVoiceVisualizer({
    onStartRecording: () => {
      if (!receiverId) return;
      emit.recording.start(receiverId);
    },
    onStopRecording: () => {
      if (!receiverId) return;
      emit.recording.stop(receiverId);
    },
  });

  useEffect(() => {
    if (!receiverId) return;
    if (debouncedText.trim()) {
      emit.typing.start(receiverId);
    } else {
      emit.typing.stop(receiverId);
    }
  }, [debouncedText, emit.typing, receiverId]);

  const send = useCallback(
    async (message: { text?: string; voice?: Blob; image?: File }) => {
      if (!receiverId) return;

      try {
        let voice, image;

        if (message.voice) {
          voice = await uploadToCloudinary(message.voice);
        } else if (message.image) {
          emit.uploading.start(receiverId);
          image = await uploadToCloudinary(message.image);
        }

        emit.message.send({
          receiverId,
          text: message.text,
          voice,
          image,
        });
      } finally {
        if (message.image) emit.uploading.stop(receiverId);
        recorderControls.clearCanvas();
      }
    },
    [emit.message, emit.uploading, receiverId, recorderControls],
  );

  useEffect(() => {
    const blob = recorderControls.recordedBlob;
    if (!blob || sentRef.current) return;

    sentRef.current = true;
    send({ voice: blob });
    recorderControls.clearCanvas();
    sentRef.current = false;
  }, [recorderControls, send]);

  if (!receiverId) return;

  if (!recorderControls.isRecordingInProgress) {
    return (
      <div className="flex items-center gap-2 border-t px-2 py-4 lg:px-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            send({ image: file });
            event.currentTarget.value = "";
          }}
        />
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <HugeiconsIcon icon={CameraIcon} />
        </Button>
        <TextareaAutosize
          maxRows={4}
          placeholder="Send a message..."
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
        />
        {text.trim().length > 0 ? (
          <Button
            size="icon-sm"
            className="rounded-full"
            onClick={() => {
              setText("");
              emit.typing.stop(receiverId);
              send({ text });
            }}
          >
            <HugeiconsIcon icon={SentIcon} />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            onClick={recorderControls.startRecording}
          >
            <HugeiconsIcon icon={Mic02Icon} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col">
        <div className="flex items-center justify-between overflow-hidden rounded-full border">
          <span className="m-2 text-sm font-medium tabular-nums">
            {recorderControls.formattedRecordingTime}
          </span>
          <div className="flex-1">
            <VoiceVisualizer
              controls={recorderControls}
              height={50}
              mainBarColor="#6468f0"
              speed={1}
              isControlPanelShown={false}
              fullscreen={true}
              isDefaultUIShown={false}
            />
          </div>
        </div>
        <div className="flex justify-between px-2 py-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={() => {
              recorderControls.stopRecording();
              recorderControls.clearCanvas();
            }}
          >
            <HugeiconsIcon icon={Trash2} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-destructive"
            onClick={recorderControls.togglePauseResume}
          >
            {recorderControls.isPausedRecording ? (
              <HugeiconsIcon icon={Mic02Icon} />
            ) : (
              <HugeiconsIcon icon={CirclePause} />
            )}
          </Button>
          <Button
            size="icon-sm"
            className="rounded-full"
            onClick={recorderControls.stopRecording}
          >
            <HugeiconsIcon icon={SentIcon} />
          </Button>
        </div>
      </div>
    </div>
  );
}
