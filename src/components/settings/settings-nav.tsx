"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, ShieldCheck, Globe, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/settings", label: "Profile", icon: UserRound },
  { href: "/settings/security", label: "Security", icon: ShieldCheck },
  { href: "/settings/custom-domains", label: "Custom domains", icon: Globe },
  { href: "/settings/utm-templates", label: "UTM templates", icon: TagIcon },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 overflow-x-auto border-b">
      {tabs.map((tab) => {
        const active =
          tab.href === "/settings"
            ? pathname === "/settings"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "border-primary text-foreground",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}