import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, autoComplete, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          autoComplete={autoComplete}
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-white px-4 py-2 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
