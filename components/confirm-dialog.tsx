'use client'
import { useCallback, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Options = { title: string; description: string; confirmLabel: string; tone?: 'danger' | 'default' }

/**
 * Promise-based confirmation dialog for consequential actions
 * (rejecting or deactivating staff, closing or rejecting a case).
 *   const [confirm, dialog] = useConfirm()
 *   if (!(await confirm({...}))) return
 */
export function useConfirm(): [(o: Options) => Promise<boolean>, React.ReactNode] {
  const [options, setOptions] = useState<Options | null>(null)
  const resolver = useRef<(v: boolean) => void>(undefined)

  const confirm = useCallback((o: Options) => {
    setOptions(o)
    return new Promise<boolean>((resolve) => { resolver.current = resolve })
  }, [])

  const finish = (value: boolean) => {
    resolver.current?.(value)
    resolver.current = undefined
    setOptions(null)
  }

  const dialog = (
    <DialogPrimitive.Root open={!!options} onOpenChange={(open) => { if (!open) finish(false) }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in focus:outline-none">
          <div className="flex gap-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${options?.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <DialogPrimitive.Title className="text-base font-semibold text-slate-900">{options?.title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm leading-relaxed text-slate-600">{options?.description}</DialogPrimitive.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => finish(false)}>Cancel</Button>
            <Button variant={options?.tone === 'danger' ? 'destructive' : 'default'} onClick={() => finish(true)}>
              {options?.confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )

  return [confirm, dialog]
}
