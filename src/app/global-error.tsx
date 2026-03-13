"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui", padding: "1rem", background: "#0f172a", color: "#e2e8f0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "24rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Algo salió mal</h1>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "1rem" }}>
            Si iniciaste sesión con Google en el celular, prueba abrir el enlace en el navegador del sistema (Chrome o Safari) en lugar del navegador interno de la app.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: "0.5rem 1rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", marginRight: "0.5rem" }}
          >
            Reintentar
          </button>
          <a href="/" style={{ padding: "0.5rem 1rem", color: "#94a3b8", fontSize: "0.875rem" }}>
            Ir al inicio
          </a>
        </div>
      </body>
    </html>
  );
}
