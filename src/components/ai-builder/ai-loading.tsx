"use client";

import { Loader2, Sparkles, Paintbrush, Layout, Type, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { icon: Sparkles, label: "Understanding your request..." },
  { icon: Paintbrush, label: "Creating theme..." },
  { icon: Layout, label: "Building layout..." },
  { icon: Type, label: "Organizing content..." },
  { icon: Box, label: "Generating blocks..." },
];

export function AILoadingStates({
  currentStep = 0,
  className,
}: {
  currentStep?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-6 py-8", className)}>
      <div className="relative">
        <div className="h-16 w-16 animate-pulse rounded-2xl bg-primary/10" />
        <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
      </div>

      <div className="space-y-3 text-center">
        <p className="text-sm font-medium">Generating your design...</p>
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  isActive
                    ? "font-medium text-primary"
                    : isDone
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground/50",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
