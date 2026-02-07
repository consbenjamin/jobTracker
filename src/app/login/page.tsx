"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthError } from "next-auth";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const AUTH_BASE = "/api/auth";

function sanitizeCallbackUrl(raw: string | null): string {
  if (!raw || typeof raw !== "string") return "/";
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "[]" || trimmed === "null") return "/";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    fetch(`${AUTH_BASE}/csrf`)
      .then((r) => r.json())
      .then((data) => setCsrfToken(data?.csrfToken ?? ""))
      .catch(() => {});
  }, []);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      if (err instanceof AuthError) setError(err.message ?? "Error al iniciar sesión");
      else setError("Error al iniciar sesión");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent dark:from-primary/10 pointer-events-none"
        aria-hidden
      />
      <Card className="w-full max-w-[400px] shadow-xl border-border/80 dark:shadow-none dark:border-border/60 relative overflow-hidden">
        <CardHeader className="space-y-4 pb-2 px-4 sm:px-6 pt-6 sm:pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 font-semibold text-lg sm:text-xl text-foreground hover:text-primary transition-colors"
          >
            <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" />
            Job Tracker
          </Link>
          <div className="space-y-1.5 text-center">
            <CardTitle className="text-xl sm:text-2xl">Iniciar sesión</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Usa Google, GitHub o tu email y contraseña
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-2 px-4 sm:px-6 pb-4">
          {error && (
            <p
              role="alert"
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5"
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form
              action={`${AUTH_BASE}/signin/google`}
              method="POST"
              className="w-full min-w-0"
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <Button
                type="submit"
                variant="outline"
                className="w-full h-11 min-w-0"
                disabled={loading || !csrfToken}
              >
                Google
              </Button>
            </form>
            <form
              action={`${AUTH_BASE}/signin/github`}
              method="POST"
              className="w-full min-w-0"
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <Button
                type="submit"
                variant="outline"
                className="w-full h-11 min-w-0"
                disabled={loading || !csrfToken}
              >
                GitHub
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-card px-3 text-muted-foreground">o con email</span>
            </div>
          </div>

          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 w-full min-w-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 w-full min-w-0"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium min-w-0"
              disabled={loading}
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground pt-2 pb-6 px-4 sm:px-6">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline ml-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Regístrate
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-background to-muted/20">
          <Card className="w-full max-w-[400px] shadow-xl">
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Cargando…</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
