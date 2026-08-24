import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/server/auth";
import { regenerateAIDesign } from "@/server/ai-builder";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await regenerateAIDesign(user.id, body);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
