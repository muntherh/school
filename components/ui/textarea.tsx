import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[110px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
