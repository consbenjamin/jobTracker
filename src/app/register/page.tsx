"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error al registrarse");
        setLoading(false);
        return;
      }
      router.push("/login?registered=1");
      router.refresh();
    } catch {
      setError("Error de conexión");
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
            <CardTitle className="text-xl sm:text-2xl">Crear cuenta</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Regístrate con tu email y contraseña
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2 px-4 sm:px-6 pb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5"
              >
                {error}
              </p>
            )}
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
              <Label htmlFor="password">Contraseña (mín. 8 caracteres)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 w-full min-w-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Repetir contraseña</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 w-full min-w-0"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium min-w-0"
              disabled={loading}
            >
              {loading ? "Creando cuenta…" : "Registrarse"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground pt-2 pb-6 px-4 sm:px-6">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline ml-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Iniciar sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
