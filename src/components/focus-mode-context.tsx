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
        <main className="min-h-screen bg-background overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-w-0">
          {children}
        </div>
      </main>
      </ThemeProvider>
    </FocusModeContext.Provider>
  );
}
