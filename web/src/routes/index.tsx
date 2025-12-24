import { createFileRoute, redirect } from "@tanstack/react-router";
import ChatContainer from "@/components/chat-container";
import Chats from "@/components/chats";
import Chat from "@/components/chat";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/signin",
        search: { redirect: location.href },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ChatContainer>
      <Chats />
      <Chat />
    </ChatContainer>
  );
}
