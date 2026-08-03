import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <LinkIcon className="h-6 w-6" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Link not found
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The link you followed doesn&apos;t exist or has been removed.
      </p>
      <div className="mt-6 flex gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>Go home</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/signup" />}>
          Create a link
        </Button>
      </div>
    </div>
  );
}