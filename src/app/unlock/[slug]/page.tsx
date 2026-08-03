import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PasswordUnlockForm } from "@/components/unlock/password-unlock-form";

export default async function UnlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;

  const link = await prisma.link.findFirst({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      destination: true,
      passwordHash: true,
    },
  });

  if (!link) {
    return (
      <MessagePage>
        <p className="text-muted-foreground">This link could not be found.</p>
        <Link
          href="/"
          className="mt-2 text-sm font-medium text-primary underline underline-offset-4"
        >
          Go home
        </Link>
      </MessagePage>
    );
  }

  if (status === "expired") {
    return (
      <MessagePage>
        <h1 className="text-xl font-semibold">Link expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link has expired and is no longer available.
        </p>
      </MessagePage>
    );
  }

  if (status === "not-active") {
    return (
      <MessagePage>
        <h1 className="text-xl font-semibold">Link not available yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link is scheduled and will become active soon.
        </p>
      </MessagePage>
    );
  }

  const isProtected = !!link.passwordHash;

  if (isProtected) {
    const cookieStore = await cookies();
    const alreadyUnlocked =
      cookieStore.get(`ln_unlock_${link.slug}`)?.value === link.id;
    if (alreadyUnlocked) {
      const { redirect } = await import("next/navigation");
      redirect(`/${encodeURIComponent(link.slug)}`);
    }
    return (
      <MessagePage>
        <h1 className="text-xl font-semibold">{link.title ?? `/${link.slug}`}</h1>
        {link.description && (
          <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
        )}
        <div className="mt-6 w-full max-w-xs">
          <PasswordUnlockForm slug={link.slug} />
        </div>
      </MessagePage>
    );
  }

  // Not protected and no status -> redirect straight through.
  const { redirect } = await import("next/navigation");
  redirect(`/${encodeURIComponent(link.slug)}`);
}

function MessagePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}