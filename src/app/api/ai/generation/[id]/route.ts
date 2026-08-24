import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/server/auth";
import { getGeneration } from "@/server/ai-builder";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const generation = await getGeneration(user.id, id);

    return NextResponse.json(generation);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
