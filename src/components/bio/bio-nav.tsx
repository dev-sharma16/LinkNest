"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PencilLine, BarChart3, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/bio/edit", label: "Edit", icon: PencilLine },
  { href: "/bio/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/bio/leads", label: "Leads", icon: Inbox },
];

export function BioNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 overflow-x-auto border-b">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
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