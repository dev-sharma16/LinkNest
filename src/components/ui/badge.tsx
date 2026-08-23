import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[12px] border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-[#753a88]/10 text-[#753a88] focus-visible:ring-[#753a88]/20 dark:bg-[#a25fba]/20 dark:text-[#a25fba] dark:focus-visible:ring-[#a25fba]/40 [a]:hover:bg-[#753a88]/20",
        outline:
          "border-[#e5e1e5] text-[#2a222b] [a]:hover:bg-[#eeecee] [a]:hover:text-[#655d67] dark:border-[#564b58] dark:text-[#faf9fb] dark:[a]:hover:bg-[#3e3040]",
        ghost:
          "hover:bg-[#eeecee] hover:text-[#655d67] dark:hover:bg-[#3e3040] dark:hover:text-[#a49da6]",
        link: "text-[#2a222b] underline-offset-4 hover:underline dark:text-[#faf9fb]",
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
