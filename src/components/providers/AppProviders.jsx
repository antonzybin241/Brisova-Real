import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import InstalledWalletsModalSync from "./InstalledWalletsModalSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <InstalledWalletsModalSync />
      {children}
    </QueryClientProvider>
  );
}
