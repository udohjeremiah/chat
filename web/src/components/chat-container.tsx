import type { ReactNode } from "react";

interface ChatContainerProps {
  children: ReactNode;
}

export default function ChatContainer({ children }: ChatContainerProps) {
  return (
    <main className="flex h-screen max-w-screen items-center justify-center px-[5%] sm:px-[15%]">
      <div className="h-[80vh] w-full overflow-hidden rounded-3xl border lg:flex">
        {children}
      </div>
    </main>
  );
}
