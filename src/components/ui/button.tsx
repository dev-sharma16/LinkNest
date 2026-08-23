import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[#564b58] dark:hover:bg-[#a49da6]",
        outline:
          "border-[#2a222b] bg-[#faf9fb] text-[#2a222b] hover:bg-[#eeecee] dark:border-[#a49da6] dark:bg-transparent dark:text-[#faf9fb] dark:hover:bg-[#3e3040]",
        secondary:
          "bg-[#faf9fb] text-[#2a222b] border-[#2a222b] hover:bg-[#eeecee] dark:bg-[#3e3040] dark:text-[#faf9fb] dark:border-[#a49da6] dark:hover:bg-[#564b58]",
        ghost:
          "hover:bg-[#eeecee] text-[#2a222b] dark:hover:bg-[#3e3040] dark:text-[#faf9fb]",
        destructive:
          "bg-[#753a88] text-[#faf9fb] hover:bg-[#a25fba] dark:bg-[#a25fba] dark:text-[#2a222b] dark:hover:bg-[#ddb7f0]",
        link: "text-[#2a222b] underline-offset-4 hover:underline dark:text-[#faf9fb]",
        tertiary:
          "bg-transparent text-[#2a222b] hover:text-[#a25fba] dark:text-[#faf9fb] dark:hover:text-[#a25fba]",
      },
      size: {
        default:
          "h-10 gap-1.5 rounded-[12px] px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-6 gap-1 rounded-[10px] px-2 text-xs in-data-[slot=button-group]:rounded-[12px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[12px] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-[12px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10 rounded-[12px]",
        "icon-xs":
          "size-6 rounded-[10px] in-data-[slot=button-group]:rounded-[12px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[12px] in-data-[slot=button-group]:rounded-[12px]",
        "icon-lg": "size-10 rounded-[12px]",
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
