import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listLeads } from "@/server/bio-leads";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? undefined;
  const leads = await listLeads(user.id, type);

  const esc = (v: string) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = "Type,Name,Email,Message,Created";
  const rows = leads.map((l) =>
    [l.type, esc(l.name ?? ""), esc(l.email), esc(l.message ?? ""), l.createdAt.toISOString()].join(","),
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads.csv"`,
    },
  });
}