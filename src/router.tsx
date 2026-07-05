import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Transfer server-fetched query cache to the client so SSR and the first
    // client render agree (prevents hydration text mismatches).
    dehydrate: () => ({ queryClientState: dehydrate(queryClient) }),
    hydrate: (dehydrated) => {
      hydrate(queryClient, (dehydrated as { queryClientState: unknown }).queryClientState);
    },
  });

  return router;
};
