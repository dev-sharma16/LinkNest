import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[9999px] border border-transparent px-3 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-[#c64545]/10 text-[#c64545] focus-visible:ring-[#c64545]/20 dark:bg-[#c64545]/20 dark:text-[#c64545] dark:focus-visible:ring-[#c64545]/40 [a]:hover:bg-[#c64545]/20",
        outline:
          "border-[#e6dfd8] text-[#141413] [a]:hover:bg-[#e8e0d2] [a]:hover:text-[#6c6a64] dark:border-[#252320] dark:text-[#faf9f5] dark:[a]:hover:bg-[#252320]",
        ghost:
          "hover:bg-[#e8e0d2] hover:text-[#6c6a64] dark:hover:bg-[#252320] dark:hover:text-[#a09d96]",
        link: "text-[#cc785c] underline-offset-4 hover:underline dark:text-[#cc785c]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
