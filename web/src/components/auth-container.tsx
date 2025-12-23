import type { ReactNode } from "react";

interface AuthContainerProps {
  children: ReactNode;
}

export default function AuthContainer({ children }: AuthContainerProps) {
  return (
    <main className="flex h-screen max-w-screen items-center justify-center px-[5%] sm:px-[15%] lg:px-[20%]">
      <div className="w-full overflow-hidden rounded-3xl border">
        <div className="grid size-full lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl p-6">{children}</div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 bg-muted/20 p-4 max-lg:hidden">
            <img
              src="/logo.svg"
              alt="Logo"
              width={24}
              height={24}
              className="size-40"
            />
            <span className="text-center text-xl font-black">
              Conversations move the world...
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
