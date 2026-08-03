import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
export type SessionUser = NonNullable<Session>["user"];

export const getSession = cache(async () => {
  const resHeaders = await headers();
  try {
    return await auth.api.getSession({
      headers: resHeaders as unknown as Headers,
    });
  } catch {
    return null;
  }
});

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}