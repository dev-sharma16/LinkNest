import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verify email",
};

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
