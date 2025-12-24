import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { User } from "@/schemas/user";
import { verify } from "@/services/auth/verify";
import AppProvider from "@/providers/app-provider";

interface RouterContext {
  user?: User;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const token = localStorage.getItem("jwt");
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
      <AppProvider>
        <Outlet />
      </AppProvider>
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
