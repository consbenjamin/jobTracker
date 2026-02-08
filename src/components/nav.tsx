"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Briefcase, PlusCircle, BarChart3, Menu, X, Search, LogOut, User, Sparkles, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
};

const mainNavItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/applications", label: "Postulaciones", icon: Briefcase },
  { href: "/discovered", label: "Vacantes descubiertas", icon: Sparkles, featured: true },
];

const moreNavItems: NavItem[] = [
  { href: "/quick-capture", label: "Captura rápida", icon: PlusCircle },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const allNavItems: NavItem[] = [...mainNavItems, ...moreNavItems];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  className,
  featured,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-sm font-medium transition-all duration-200 rounded-md px-2.5 py-1.5",
        isActive ? "text-primary bg-accent/80" : "text-muted-foreground",
        featured
          ? "hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 dark:hover:bg-amber-500/20 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-[1.02]"
          : "hover:text-primary hover:bg-accent/50",
        className
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", featured && "text-amber-600 dark:text-amber-500")} />
      {label}
    </Link>
  );
}

type SearchResult = { id: string; company: string; role: string };

export function Nav({ searchInputRef: externalSearchRef }: { searchInputRef?: React.RefObject<HTMLInputElement | null> }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const searchInputRef = externalSearchRef ?? internalSearchRef;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchRequestQueryRef = useRef<string>("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !isInput) {
        e.preventDefault();
        router.push("/quick-capture");
      }
      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        router.push("/quick-capture");
      }
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        target.blur?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, searchInputRef]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const query = searchQuery.trim();
      searchRequestQueryRef.current = query;
      setSearchLoading(true);
      fetch(`/api/applications?search=${encodeURIComponent(query)}`)
        .then((res) => res.json().then((data: unknown) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (searchRequestQueryRef.current !== query) return;
          setSearchLoading(false);
          if (!ok || !Array.isArray(data)) {
            setSearchResults([]);
            return;
          }
          setSearchResults((data as SearchResult[]).slice(0, 8));
        })
        .catch(() => {
          if (searchRequestQueryRef.current !== query) return;
          setSearchLoading(false);
          setSearchResults([]);
        });
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="w-full max-w-7xl mx-auto flex h-14 items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 min-w-0">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <Briefcase className="h-6 w-6" />
          Job Tracker
        </Link>

        {/* Desktop: search + nav */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md justify-center min-w-0">
          <div className="relative w-full max-w-xs min-w-0" ref={searchContainerRef}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef as React.RefObject<HTMLInputElement>}
              type="search"
              placeholder="Buscar empresa, rol…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => searchQuery && setSearchOpen(true)}
              className="pl-8 h-9 bg-muted/50"
              aria-label="Buscar postulaciones"
            />
            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md py-1 z-50 max-h-64 overflow-auto">
                {searchLoading ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Buscando…
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((app) => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="block px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setSearchOpen(false)}
                    >
                      <span className="font-medium">{app.company}</span>
                      <span className="text-muted-foreground"> — {app.role}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Sin resultados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav: principales + dropdown Más */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          {mainNavItems.map(({ href, label, icon: Icon, featured }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              icon={Icon}
              isActive={pathname === href || (href !== "/" && pathname.startsWith(href))}
              featured={featured}
            />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/50 gap-2 rounded-md px-2.5 py-1.5 h-auto",
                  moreNavItems.some(({ href }) => pathname === href || pathname.startsWith(href + "/"))
                    ? "text-primary bg-accent/80"
                    : ""
                )}
                aria-label="Más opciones"
              >
                <MoreHorizontal className="h-4 w-4" />
                Más
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {moreNavItems.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link
                    href={href}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {status === "authenticated" && session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 max-w-[200px] min-w-0"
                  aria-label="Menú de cuenta"
                >
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-muted-foreground">
                    {session.user.email ?? session.user.name ?? "Usuario"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground mb-0.5">Sesión</p>
                  <p className="text-sm font-medium truncate" title={session.user.email ?? undefined}>
                    {session.user.email ?? session.user.name ?? "Usuario"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut({ redirect: false, callbackUrl: "/login" });
                    window.location.href = "/login";
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {status === "authenticated" && (
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={async () => {
              await signOut({ redirect: false, callbackUrl: "/login" });
              window.location.href = "/login";
            }}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background w-full max-w-7xl mx-auto px-4 py-4 min-w-0">
          <nav className="flex flex-col gap-1">
            {allNavItems.map(({ href, label, icon: Icon, featured }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={Icon}
                isActive={pathname === href || (href !== "/" && pathname.startsWith(href))}
                onClick={() => setMobileOpen(false)}
                featured={featured}
                className="rounded-lg px-3 py-2 hover:bg-accent"
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
