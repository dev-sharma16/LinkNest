import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getApiUser() {
  const h = await headers();
  try {
    const session = await auth.api.getSession({
      headers: h as unknown as Headers,
    });
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}