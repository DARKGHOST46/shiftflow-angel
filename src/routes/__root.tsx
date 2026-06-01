import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppProvider } from "@/lib/app-context";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "ShiftFlow Nurse — 24h Shift Scheduler" },
      { name: "description", content: "Premium nurse scheduler for the 24h shift + 4 rest day rotation." },
      { name: "theme-color", content: "#0f0f1a" },
      { property: "og:title", content: "ShiftFlow Nurse — 24h Shift Scheduler" },
      { name: "twitter:title", content: "ShiftFlow Nurse — 24h Shift Scheduler" },
      { property: "og:description", content: "Premium nurse scheduler for the 24h shift + 4 rest day rotation." },
      { name: "twitter:description", content: "Premium nurse scheduler for the 24h shift + 4 rest day rotation." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b69cde9c-13fc-4960-a3ed-c481eb8de036/id-preview-3882361b--13d278e7-0c2e-4846-9f24-4b2afa16fa30.lovable.app-1779058516724.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b69cde9c-13fc-4960-a3ed-c481eb8de036/id-preview-3882361b--13d278e7-0c2e-4846-9f24-4b2afa16fa30.lovable.app-1779058516724.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Outlet />
          <Toaster position="top-center" />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
