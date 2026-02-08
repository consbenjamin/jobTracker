import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { FocusModeProvider } from "@/components/focus-mode-context";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Seguimiento de postulaciones y búsqueda de empleo",
};

const themeScript = `
(function() {
  const key = 'job-tracker-theme';
  const stored = localStorage.getItem(key);
  const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon-light.png" type="image/png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icon-dark.png" type="image/png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/icon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/icon-dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <FocusModeProvider>{children}</FocusModeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
