import { useActionState } from "react";

import { Field, FieldGroup } from "@/components/ui/field";
import { formatServiceError } from "@/utils/format-service-error";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

import { useApp } from "@/providers/app-provider";
import { startNewChat } from "@/services/chats/start-new-chat";

export type ActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

interface NewChatFormProps {
  closeDialog: () => void;
}

export default function NewChatForm({ closeDialog }: NewChatFormProps) {
  const { app, setApp, emit } = useApp();

  async function startNewChatAction(
    _: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    try {
      const result = await startNewChat(formData.get("username") as string);
      const receiver = result.data.receiver;

      setApp((prev) => ({
        ...prev,
        chatList: {
          ...prev.chatList,
          [receiver._id]: {
            user: receiver,
            isOnline: false,
            lastMessage: undefined,
            unreadMessages: 0,
            typing: false,
            recording: false,
            uploading: false,
          },
        },
        chat: {
          ...prev.chat,
          [receiver._id]: [],
        },
        activeChatUserId: receiver._id,
      }));

      emit.presence.get(receiver._id);
      closeDialog();

      return { status: "success" };
    } catch (error) {
      return {
        status: "error",
        message: formatServiceError(error),
      };
    }
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    startNewChatAction,
    { status: "idle" },
  );

  return (
    <form
      action={(formData) => {
        const username = formData.get("username") as string;
        const chats = Object.entries(app.chatList ?? {});
        const existingChat = chats.find(
          ([_, chat]) => chat.user.username === username.trim().toLowerCase(),
        );
        if (existingChat) {
          setApp((prev) => ({ ...prev, activeChatUserId: existingChat[0] }));
          closeDialog();
          return;
        }

        formAction(formData);
      }}
    >
      <FieldGroup className="gap-4 max-md:px-4">
        <Field>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              disabled={pending}
              id="username"
              name="username"
              type="text"
              placeholder="udohjeremiah"
              minLength={3}
              required
            />
          </InputGroup>
        </Field>
        {!pending && state.status === "error" && (
          <p role="alert" className="text-center text-sm text-destructive">
            {state.message}
          </p>
        )}
        <Field>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Starting chat..." : "Start chat"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
