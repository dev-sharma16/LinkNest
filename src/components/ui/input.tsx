import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[8px] border border-[#e6dfd8] bg-[#faf9f5] px-3.5 py-2.5 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[#cc785c] focus-visible:ring-2 focus-visible:ring-[#cc785c]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#e8e0d2]/50 disabled:opacity-50 aria-invalid:border-[#c64545] aria-invalid:ring-2 aria-invalid:ring-[#c64545]/20 md:text-sm dark:bg-[#252320] dark:border-[#252320] dark:text-[#faf9f5] dark:placeholder:text-[#a09d96] dark:focus-visible:border-[#cc785c] dark:focus-visible:ring-[#cc785c]/15 dark:disabled:bg-[#1f1e1b] dark:aria-invalid:border-[#c64545]/50 dark:aria-invalid:ring-[#c64545]/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
