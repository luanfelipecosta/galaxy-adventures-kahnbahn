import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold outline-none transition-[background-color,color,opacity,transform] duration-150 ease-[var(--ease-out-quart)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary-foreground px-4 py-2 text-white hover:bg-foreground active:translate-y-px',
        secondary: 'px-4 py-2 text-primary-foreground hover:bg-secondary hover:text-foreground active:translate-y-px',
        outline:
          'border border-border bg-card px-4 py-2 font-medium text-muted-foreground hover:bg-secondary hover:text-foreground active:translate-y-px data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary-foreground',
        ghost: 'px-3 py-2 font-medium text-muted-foreground hover:bg-secondary hover:text-foreground active:translate-y-px',
        icon: 'size-8 min-h-8 border border-border bg-card p-0 text-muted-foreground hover:bg-secondary hover:text-foreground',
      },
      size: {
        default: 'min-h-10',
        sm: 'min-h-9 px-3',
        icon: 'size-10 min-h-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return <Comp ref={ref} className={cn(buttonVariants({ className, size, variant }))} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
