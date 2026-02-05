import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Nav />
          <main className="min-h-screen p-4 sm:p-6 bg-background overflow-x-hidden">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
