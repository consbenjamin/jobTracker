import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const emailStr = email?.trim?.()?.toLowerCase?.();
    if (!emailStr || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findFirst({
      where: { email: emailStr },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: emailStr,
        password: hashed,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al registrar" },
      { status: 500 }
    );
  }
}
