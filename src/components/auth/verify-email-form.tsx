"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);

  async function handleVerify() {
    if (!token) {
      toast.error("Missing verification token");
      return;
    }
    setIsLoading(true);
    const { error } = await authClient.verifyEmail({
      query: { token, callbackURL: "/dashboard" },
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message ?? "Verification failed");
      return;
    }

    toast.success("Email verified successfully");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        {token
          ? "Confirm your email address to activate your account."
          : "Check your inbox and click the verification link. Once verified you can sign in."}
      </p>
      {token && (
        <Button onClick={handleVerify} disabled={isLoading}>
          {isLoading ? "Verifying…" : "Verify email"}
        </Button>
      )}
    </div>
  );
}
