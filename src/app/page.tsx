import Link from "next/link";
import { LinkIcon, BarChart3, QrCode, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

const features = [
  {
    icon: LinkIcon,
    title: "Smart Links",
    description: "Short, branded links that you fully control with custom slugs.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track clicks, countries, devices, browsers and referrers.",
  },
  {
    icon: QrCode,
    title: "QR Codes",
    description: "Generate scannable QR codes for every link instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    description: "Password protection, expiration and scheduling built in.",
  },
  {
    icon: Zap,
    title: "Fast Redirects",
    description: "A redirect engine tuned for speed and reliability.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LinkIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">LinkNest</span>
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <Button nativeButton={false} render={<Link href="/dashboard" />}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button nativeButton={false} render={<Link href="/signup" />}>Get started</Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Your links, your rules.
              <span className="block text-primary">
                All in one platform.
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              LinkNest combines smart URL shortening, deep analytics, QR codes
              and link tools into a single dashboard for creators and
              businesses.
            </p>
            <div className="mt-8 flex gap-3">
              {user ? (
                <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
                  Open dashboard
                </Button>
              ) : (
                <>
                  <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
                    Create free account
                  </Button>
                  <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/login" />}>
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <LinkIcon className="h-4 w-4" />
              </span>
              <div className="text-sm font-medium">linknest.dev/socials</div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3 text-sm">
                <span>Total clicks</span>
                <span className="font-semibold">12,482</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3 text-sm">
                <span>Countries reached</span>
                <span className="font-semibold">64</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3 text-sm">
                <span>Top device</span>
                <span className="font-semibold">Mobile</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <feature.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LinkNest. Built for creators.
      </footer>
    </div>
  );
}
