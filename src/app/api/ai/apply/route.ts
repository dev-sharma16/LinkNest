import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/server/auth";
import {
  applyAIDesignToBio,
  applyAIDesignToStorefront,
} from "@/server/ai-builder";
import type { AIDesignSpecification } from "@/lib/validations/ai-builder";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, designSpec, storefrontId } = body as {
      targetType: "link_in_bio" | "storefront";
      designSpec: AIDesignSpecification;
      storefrontId?: string;
    };

    if (!targetType || !designSpec) {
      return NextResponse.json(
        { error: "targetType and designSpec are required" },
        { status: 400 },
      );
    }

    if (targetType === "link_in_bio") {
      await applyAIDesignToBio(user.id, designSpec);
    } else if (targetType === "storefront") {
      if (!storefrontId) {
        return NextResponse.json(
          { error: "storefrontId is required for storefront" },
          { status: 400 },
        );
      }
      await applyAIDesignToStorefront(user.id, storefrontId, designSpec);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
