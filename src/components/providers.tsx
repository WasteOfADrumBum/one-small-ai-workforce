"use client";

import { ThemeProvider, ToastProvider } from "@onesmall/ui";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultMode="system" storageKey="one-small-ai-workforce-theme">
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
