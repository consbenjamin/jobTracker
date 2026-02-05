"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toaster } from "sonner";
import { Nav } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

const FocusModeContext = createContext<{
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
}>({ focusMode: false, setFocusMode: () => {} });

export function useFocusMode() {
  return useContext(FocusModeContext);
}

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusMode] = useState(false);
  return (
    <FocusModeContext.Provider value={{ focusMode, setFocusMode }}>
      <ThemeProvider>
        <PwaRegister />
        <Toaster position="bottom-right" richColors closeButton />
        {!focusMode && <Nav />}
        <main className="min-h-screen p-4 sm:p-6 bg-background overflow-x-hidden">{children}</main>
      </ThemeProvider>
    </FocusModeContext.Provider>
  );
}
