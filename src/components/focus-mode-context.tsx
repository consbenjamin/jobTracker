"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Toaster } from "sonner";
import { Nav } from "@/components/nav";
import { LandingNav } from "@/components/landing-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

const FocusModeContext = createContext<{
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
}>({ focusMode: false, setFocusMode: () => {} });

export function useFocusMode() {
  return useContext(FocusModeContext);
}

const AUTH_PATHS = ["/login", "/register"];

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusMode] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthPage = pathname && AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isLanding = pathname === "/" && status !== "authenticated";

  return (
    <FocusModeContext.Provider value={{ focusMode, setFocusMode }}>
      <ThemeProvider>
        <PwaRegister />
        <Toaster position="bottom-right" richColors closeButton />
        {!focusMode && isAuthPage && null}
        {!focusMode && !isAuthPage && isLanding && <LandingNav />}
        {!focusMode && !isAuthPage && !isLanding && <Nav />}
        {isAuthPage ? (
          <div className="min-h-screen">{children}</div>
        ) : isLanding ? (
          <main className="min-h-screen bg-background overflow-x-hidden">
            {children}
          </main>
        ) : (
          <main className="min-h-screen bg-background overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-w-0">
              {children}
            </div>
          </main>
        )}
      </ThemeProvider>
    </FocusModeContext.Provider>
  );
}
