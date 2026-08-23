import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[8px] border border-[#e6dfd8] bg-[#faf9f5] px-3.5 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-[#cc785c] focus-visible:ring-2 focus-visible:ring-[#cc785c]/15 disabled:cursor-not-allowed disabled:bg-[#e8e0d2]/50 disabled:opacity-50 aria-invalid:border-[#c64545] aria-invalid:ring-2 aria-invalid:ring-[#c64545]/20 md:text-sm dark:bg-[#252320] dark:border-[#252320] dark:text-[#faf9f5] dark:placeholder:text-[#a09d96] dark:focus-visible:border-[#cc785c] dark:focus-visible:ring-[#cc785c]/15 dark:disabled:bg-[#1f1e1b] dark:aria-invalid:border-[#c64545]/50 dark:aria-invalid:ring-[#c64545]/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
