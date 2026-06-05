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
import { ProfileProvider } from "@/lib/profile-context";
import { Toaster } from "@/components/ui/sonner";
import "leaflet/dist/leaflet.css";
import { GlobalErrorBoundary } from "@/components/error-boundary";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "ShiftFlow Nurse — 24h Shift Scheduler" },
      { name: "description", content: "Premium nurse scheduler for the 24h shift + 4 rest day rotation." },
      { name: "theme-color", content: "#0f0f1a" },
      { property: "og:title", content: "ShiftFlow Nurse — 24h Shift Scheduler" },
      { name: "twitter:title", content: "ShiftFlow Nurse — 24h Shift Scheduler" },
      { property: "og:description", content: "Premium nurse scheduler for the 24h shift + 4 rest day rotation." },
      { name: "twitter:description", content: "Premium nurse scheduler for the 24h shift + 4 rest day rotation." },
      { property: "og:image", content: "https://shiftflow.online/icon.svg" },
      { name: "twitter:image", content: "https://shiftflow.online/icon.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://shiftflow.online" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://shiftflow.online" }
    ],
  }),
  errorComponent: GlobalErrorBoundary,
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
        <ProfileProvider>
          <AppProvider>
            <Outlet />
            <Toaster position="top-center" />
          </AppProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
