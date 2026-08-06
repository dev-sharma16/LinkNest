import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Verify email",
  description: "Verify your email address to finish setting up your LinkNest account.",
  path: "/verify-email",
  noindex: true,
});

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verify your email"
      description="One last step before you're all set"
    >
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthCard>
  );
}
