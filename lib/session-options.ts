import type { SessionOptions } from "iron-session";

export interface SessionData {
  authenticated?: boolean;
  createdAt?: number;
}

export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }

  return {
    password,
    cookieName: "parameter-tasks-session",
    ttl: 0,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: undefined,
    },
  };
}
