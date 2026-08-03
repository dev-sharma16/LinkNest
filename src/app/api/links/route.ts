import { getApiUser, unauthorizedResponse } from "@/server/auth";
import { listLinks, createLink } from "@/server/links";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  try {
    const result = await listLinks(user.id, {
      search: searchParams.get("search") ?? undefined,
      folderId: searchParams.get("folderId") ?? undefined,
      tagId: searchParams.get("tagId") ?? undefined,
      archived:
        searchParams.get("archived") === "true"
          ? true
          : searchParams.get("archived") === "false"
            ? false
            : undefined,
      favorite: searchParams.get("favorite") === "true",
      sort: (searchParams.get("sort") ?? undefined) as "createdAt" | "clicks" | "title",
      order: (searchParams.get("order") ?? undefined) as "asc" | "desc",
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? undefined),
    });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Failed to load links" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const link = await createLink(user, body);
    return Response.json(link, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create link";
    return Response.json({ error: message }, { status: 400 });
  }
}