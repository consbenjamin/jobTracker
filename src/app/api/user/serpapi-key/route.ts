import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { encrypt } from "@/lib/encrypt";

/**
 * GET: Devuelve si el usuario tiene una API key de SerpApi guardada. Nunca devuelve la key.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { serpApiKeyEncrypted: true },
    });
    const hasKey = Boolean(user?.serpApiKeyEncrypted);
    return NextResponse.json({ hasKey });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al consultar" }, { status: 500 });
  }
}

/**
 * POST: Guarda o borra la API key de SerpApi del usuario (cifrada en BD).
 * Body: { apiKey: string }. Vacío o "" para borrar. Máx. 500 caracteres.
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const raw = body?.apiKey;
    const value = typeof raw === "string" ? raw.trim() : "";

    if (value.length > 500) {
      return NextResponse.json(
        { error: "La API key no puede superar 500 caracteres" },
        { status: 400 }
      );
    }

    if (value === "") {
      await prisma.user.update({
        where: { id: userId },
        data: { serpApiKeyEncrypted: null },
      });
      return NextResponse.json({ hasKey: false });
    }

    const encrypted = encrypt(value);
    await prisma.user.update({
      where: { id: userId },
      data: { serpApiKeyEncrypted: encrypted },
    });
    return NextResponse.json({ hasKey: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { error: "El servidor no tiene configurado AUTH_SECRET para cifrar la key" },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Error al guardar la API key" }, { status: 500 });
  }
}
