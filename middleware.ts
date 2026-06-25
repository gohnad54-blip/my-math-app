import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { getSessionOptions, type SessionData } from "@/lib/session-options";

function isProtectedPage(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/generate" ||
    pathname.startsWith("/generate/") ||
    pathname === "/task" ||
    pathname.startsWith("/task/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  let session: SessionData;

  try {
    session = await getIronSession<SessionData>(
      request,
      response,
      getSessionOptions(),
    );
  } catch (error) {
    console.error("middleware session error:", error);

    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Сервер не налаштовано" },
        { status: 500 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.authenticated) {
    if (pathname === "/login" || pathname === "/") {
      return NextResponse.redirect(new URL("/generate", request.url));
    }

    return response;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname === "/login") {
    return response;
  }

  if (isProtectedPage(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/generate",
    "/generate/:path*",
    "/task",
    "/task/:path*",
    "/api/:path*",
  ],
};
