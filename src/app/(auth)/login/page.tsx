import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  const googleEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your LinkNest account"
    >
      <LoginForm googleEnabled={googleEnabled} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
