import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ring-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        secondary: "border-transparent bg-slate-100 text-slate-700 ring-slate-500/15",
        destructive: "border-transparent bg-red-50 text-red-700 ring-red-600/20",
        danger: "border-transparent bg-red-50 text-red-700 ring-red-600/20",
        outline: "border-slate-200 text-slate-700",
        info: "border-transparent bg-sky-50 text-sky-700 ring-sky-600/20",
        warning: "border-transparent bg-amber-50 text-amber-700 ring-amber-600/25",
        success: "border-transparent bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        gray: "border-transparent bg-slate-100 text-slate-600 ring-slate-500/15",
        violet: "border-transparent bg-violet-50 text-violet-700 ring-violet-600/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
