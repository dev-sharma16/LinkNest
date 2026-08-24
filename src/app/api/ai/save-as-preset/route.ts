import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/server/auth";
import { saveAIAsPreset } from "@/server/ai-builder";
import type { AIDesignSpecification } from "@/lib/validations/ai-builder";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { designSpec, name, description } = body as {
      designSpec: AIDesignSpecification;
      name: string;
      description?: string;
    };

    if (!designSpec || !name) {
      return NextResponse.json(
        { error: "designSpec and name are required" },
        { status: 400 },
      );
    }

    const preset = await saveAIAsPreset(user.id, designSpec, name, description);

    return NextResponse.json(preset);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
