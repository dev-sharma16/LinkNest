import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[#a9583e] dark:hover:bg-[#a9583e]",
        outline:
          "border-[#e6dfd8] bg-[#faf9f5] text-[#141413] hover:bg-[#e8e0d2] dark:border-[#252320] dark:bg-transparent dark:text-[#faf9f5] dark:hover:bg-[#252320]",
        secondary:
          "bg-[#faf9f5] text-[#141413] border-[#e6dfd8] hover:bg-[#e8e0d2] dark:bg-[#252320] dark:text-[#faf9f5] dark:border-[#252320] dark:hover:bg-[#1f1e1b]",
        ghost:
          "hover:bg-[#e8e0d2] text-[#141413] dark:hover:bg-[#252320] dark:text-[#faf9f5]",
        destructive:
          "bg-[#c64545] text-white hover:bg-[#b03e3e] dark:bg-[#c64545] dark:text-white dark:hover:bg-[#b03e3e]",
        link: "text-[#cc785c] underline-offset-4 hover:underline dark:text-[#cc785c]",
      },
      size: {
        default:
          "h-10 gap-1.5 rounded-[8px] px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-6 gap-1 rounded-[6px] px-2 text-xs in-data-[slot=button-group]:rounded-[8px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[8px] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-[8px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10 rounded-[8px]",
        "icon-xs":
          "size-6 rounded-[6px] in-data-[slot=button-group]:rounded-[8px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[8px] in-data-[slot=button-group]:rounded-[8px]",
        "icon-lg": "size-10 rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
