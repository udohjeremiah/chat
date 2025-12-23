import { createFileRoute, redirect } from "@tanstack/react-router";
import ChatContainer from "@/components/chat-container";

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
      <></>
    </ChatContainer>
  );
}
