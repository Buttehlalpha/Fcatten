import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import "./styles.css";

// In the packaged app the bundle is served from the device (capacitor://localhost),
// so server-function calls must be sent to the deployed site instead of a relative URL.
const SERVER_ORIGIN = (
  import.meta.env["VITE_SERVER_ORIGIN"] ?? "https://atbuattebdance-com.lovable.app"
).replace(/\/$/, "");

function absolutize(url: string) {
  return url.startsWith("/_serverFn") || url.startsWith("/api/")
    ? `${SERVER_ORIGIN}${url}`
    : url;
}

const nativeFetch = window.fetch.bind(window);
window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === "string") return nativeFetch(absolutize(input), init);
  if (input instanceof Request && input.url.startsWith("/")) {
    return nativeFetch(new Request(absolutize(input.url), input), init);
  }
  return nativeFetch(input as RequestInfo, init);
}) as typeof window.fetch;

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
