"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LinkIcon,
  LayoutDashboard,
  BarChart3,
  Settings,
  Menu,
  X,
  UserRound,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "@/components/dashboard/user-menu";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: LinkIcon },
  { href: "/bio", label: "Link in Bio", icon: UserRound },
  { href: "/storefronts", label: "Storefronts", icon: Store },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const active =
          item.href === "/links"
            ? pathname.startsWith("/links")
            : item.href === "/bio"
              ? pathname.startsWith("/bio")
              : item.href === "/storefronts"
                ? pathname.startsWith("/storefronts")
                : item.href === "/analytics"
                  ? pathname.startsWith("/analytics")
                  : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-muted text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/links" className="flex items-center gap-2 px-4 pt-4 pb-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LinkIcon className="h-4 w-4" />
      </span>
      <span className="text-base font-semibold tracking-tight">LinkNest</span>
    </Link>
  );
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  userImage,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userImage?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background md:flex">
        <Brand />
        <div className="mt-2 flex-1">
          <NavLinks />
        </div>
        <div className="border-t p-3">
          <UserMenu userName={userName} userEmail={userEmail} userImage={userImage} />
        </div>
      </aside>

{/* Mobile header */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
        <Link href="/links" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LinkIcon className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">LinkNest</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <div className="flex items-center justify-between pr-2">
            <Brand />
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
          <div className="mt-4 border-t p-3">
            <UserMenu
              userName={userName}
              userEmail={userEmail}
              userImage={userImage}
            />
          </div>
        </SheetContent>
      </Sheet>

      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}