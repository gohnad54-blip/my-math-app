import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";

const authBodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = authBodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Невірний формат запиту" },
      { status: 400 },
    );
  }

  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    return NextResponse.json(
      { error: "Сервер не налаштовано" },
      { status: 500 },
    );
  }

  if (parsed.data.password !== appPassword) {
    return NextResponse.json({ error: "Невірний пароль" }, { status: 401 });
  }

  const session = await getSession();
  session.authenticated = true;
  session.createdAt = Date.now();
  await session.save();

  return NextResponse.json({ success: true });
}
