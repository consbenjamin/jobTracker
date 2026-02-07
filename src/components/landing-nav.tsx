"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto flex h-14 items-center justify-between gap-2 px-4 sm:px-6 min-w-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
        >
          <Briefcase className="h-6 w-6 shrink-0" />
          <span className="truncate">Job Tracker</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm" className="text-sm shrink-0">
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
