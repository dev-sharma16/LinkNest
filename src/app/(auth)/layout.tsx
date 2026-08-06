import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LinkIcon className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">LinkNest</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}