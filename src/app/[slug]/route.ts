import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { appendUtm } from "@/lib/url";
import { parseUserAgent } from "@/lib/tracking";
import { recordClick } from "@/server/tracking";

export const runtime = "nodejs";

function statusUrl(request: NextRequest, slug: string, status: string) {
  const url = new URL(`/unlock/${encodeURIComponent(slug)}`, request.url);
  url.searchParams.set("status", status);
  return url;
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/[slug]">,
) {
  const { slug } = await ctx.params;

  const link = await prisma.link.findFirst({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      slug: true,
      destination: true,
      passwordHash: true,
      activateAt: true,
      expiresAt: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmTerm: true,
      utmContent: true,
      iosDeepLink: true,
      androidDeepLink: true,
    },
  });

  if (!link) return notFound();

  const now = new Date();

  if (link.activateAt && now < link.activateAt) {
    return NextResponse.redirect(
      statusUrl(request, link.slug, "not-active"),
      302,
    );
  }

  if (link.expiresAt && now > link.expiresAt) {
    return NextResponse.redirect(
      statusUrl(request, link.slug, "expired"),
      302,
    );
  }

  if (link.passwordHash) {
    const unlocked = request.cookies.get(`ln_unlock_${link.slug}`)?.value;
    if (unlocked !== link.id) {
      return NextResponse.redirect(
        statusUrl(request, link.slug, "password"),
        302,
      );
    }
  }

  const ua = parseUserAgent(request.headers.get("user-agent"));

  let destination = link.destination;
  const utm = {
    utmSource: link.utmSource,
    utmMedium: link.utmMedium,
    utmCampaign: link.utmCampaign,
    utmTerm: link.utmTerm,
    utmContent: link.utmContent,
  };

  if (ua.device === "Mobile" && link.iosDeepLink && ua.os === "iOS") {
    destination = link.iosDeepLink;
  } else if (ua.device === "Mobile" && link.androidDeepLink && ua.os === "Android") {
    destination = link.androidDeepLink;
  } else {
    destination = appendUtm(destination, utm);
  }

  await recordClick(link.id, request);

  return NextResponse.redirect(destination, 302);
}