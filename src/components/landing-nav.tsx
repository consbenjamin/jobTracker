"use client";

import Link from "next/link";
import { Briefcase, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-6 min-w-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors min-w-0"
        >
          <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
          <span className="truncate">Job Tracker</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 shrink-0">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="text-sm size-9 sm:size-auto sm:h-9 sm:px-3 sm:py-2 p-0">
            <Link href="/login" className="flex items-center justify-center gap-2" aria-label="Iniciar sesión">
              <LogIn className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="text-sm shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 size-9 sm:size-auto sm:h-9 sm:px-4 sm:py-2 p-0">
            <Link href="/register" className="flex items-center justify-center gap-2" aria-label="Registrarse">
              <UserPlus className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Registrarse</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
