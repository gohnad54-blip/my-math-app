import type { SessionOptions } from "iron-session";

export interface SessionData {
  authenticated?: boolean;
  createdAt?: number;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "parameter-tasks-session",
  ttl: 0,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: undefined,
  },
};
