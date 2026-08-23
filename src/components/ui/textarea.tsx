import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[12px] border border-[#d4d1d5] bg-white px-4 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-[#2a222b] focus-visible:ring-2 focus-visible:ring-[#a25fba]/30 disabled:cursor-not-allowed disabled:bg-[#eeecee]/50 disabled:opacity-50 aria-invalid:border-[#753a88] aria-invalid:ring-2 aria-invalid:ring-[#753a88]/20 md:text-sm dark:bg-[#3e3040]/30 dark:border-[#564b58] dark:text-[#faf9fb] dark:placeholder:text-[#a49da6] dark:focus-visible:border-[#a25fba] dark:focus-visible:ring-[#a25fba]/30 dark:disabled:bg-[#3e3040]/80 dark:aria-invalid:border-[#a25fba]/50 dark:aria-invalid:ring-[#a25fba]/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
