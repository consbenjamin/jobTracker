import { prisma } from "@/lib/db";

/**
 * Auto-ghost: si una aplicación sigue en "Applied" y no se actualiza
 * durante el último mes (usando updatedAt), se marca como "Ghosted".
 *
 * Se ejecuta desde el cron global. El comportamiento es por usuario
 * vía User.autoGhostApplied.
 */
export async function ghostStaleAppliedApplications(options?: { days?: number }) {
  const days = options?.days ?? 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await prisma.application.updateMany({
    where: {
      status: "Applied",
      updatedAt: { lt: cutoff },
      user: { autoGhostApplied: true },
    },
    data: {
      status: "Ghosted",
    },
  });

  return { updatedCount: result.count };
}

