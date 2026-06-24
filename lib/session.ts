import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session-options";

export type { SessionData } from "@/lib/session-options";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
