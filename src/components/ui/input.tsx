import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[12px] border border-[#d4d1d5] bg-white px-4 py-2.5 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[#2a222b] focus-visible:ring-2 focus-visible:ring-[#a25fba]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#eeecee]/50 disabled:opacity-50 aria-invalid:border-[#753a88] aria-invalid:ring-2 aria-invalid:ring-[#753a88]/20 md:text-sm dark:bg-[#3e3040]/30 dark:border-[#564b58] dark:text-[#faf9fb] dark:placeholder:text-[#a49da6] dark:focus-visible:border-[#a25fba] dark:focus-visible:ring-[#a25fba]/30 dark:disabled:bg-[#3e3040]/80 dark:aria-invalid:border-[#a25fba]/50 dark:aria-invalid:ring-[#a25fba]/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
