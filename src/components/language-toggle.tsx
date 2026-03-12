"use client";

import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={lang === "es" ? "Cambiar a inglés" : "Switch to Spanish"}
    >
      <span
        className={`px-1.5 py-0.5 rounded-full ${
          lang === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        ES
      </span>
      <span
        className={`px-1.5 py-0.5 rounded-full ${
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </span>
    </button>
  );
}

