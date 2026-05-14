import { cn } from '@/utils/utils'

/** Two segments: first fills on step 1, both on step 2; hidden on intro & confirmation. */
export function WizardStepBars({ filledBars }: { filledBars: 1 | 2 }) {
  return (
    <div className="flex w-full gap-2" role="presentation" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full bg-foreground transition-[width] duration-300 ease-out',
              (i === 0 && filledBars >= 1) || (i === 1 && filledBars >= 2) ? 'w-full' : 'w-0',
            )}
          />
        </div>
      ))}
    </div>
  )
}
