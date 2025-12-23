import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { User } from "@/schemas/user";
import { verify } from "@/services/auth/verify";

interface RouterContext {
  user: User | undefined;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const result = await verify(token);
      context.user = result.data.user;
      return context;
    } catch {
      return;
    }
  },
  component: () => (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
});
