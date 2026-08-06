import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Create an account",
  description:
    "Create your free LinkNest account and start shortening links, building a link-in-bio page and tracking clicks in seconds.",
  path: "/signup",
});

export default function SignupPage() {
  const googleEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <AuthCard
      title="Create your account"
      description="Start shortening links in seconds"
    >
      <SignupForm googleEnabled={googleEnabled} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
