import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/shadCN/button'
import { Input } from '@/components/ui/shadCN/input'
import { TextContent } from '@/components/TextContent'
import { cn } from '@/utils/utils'
import { WizardStepBars } from '@/components/flows/WizardStepBars'
import type { MobelaboWizardState } from '@/types/chat'

const MOBELABO_CATEGORIES = [
  'Lamps',
  'Cabinets',
  'Chairs',
  'Tables',
  'Garden',
  'Best-Price',
  'Armchairs',
  'Various',
  'Sofas',
] as const

const stepFooterClass = 'mt-3 border-t border-border pt-4'

interface MobelaboFlowProps {
  state: MobelaboWizardState
  onChange: (next: MobelaboWizardState) => void
}

function MobelaboFlow({ state, onChange }: MobelaboFlowProps) {
  const { step, selectedCategories, lastName, firstName, email } = state

  function toggleCategory(name: string) {
    const nextCats = selectedCategories.includes(name)
      ? selectedCategories.filter((x) => x !== name)
      : [...selectedCategories, name]
    onChange({ ...state, selectedCategories: nextCats })
  }

  function handleBackRow() {
    if (step === 'categories') {
      onChange({ ...state, step: 'intro' })
      return
    }
    if (step === 'info') {
      onChange({ ...state, step: 'categories' })
      return
    }
    if (step === 'confirmation') {
      onChange({ ...state, step: 'categories' })
    }
  }

  if (step === 'intro') {
    return (
      <div className="w-full space-y-4 text-foreground">
        <TextContent variant="textLarge" className="!font-semibold uppercase tracking-wide text-foreground">
          MÖBELABO
        </TextContent>
        <TextContent variant="textMedium" className="text-foreground leading-relaxed">
          Get updates on your favorite categories and grab new arrivals before they&apos;re gone. Cancel anytime.
        </TextContent>
        <div className={stepFooterClass}>
          <Button
            type="button"
            variant="black"
            className="w-full rounded-full h-10"
            onClick={() => onChange({ ...state, step: 'categories' })}
          >
            Configure
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'categories') {
    return (
      <div className="w-full space-y-4 text-foreground">
        <TextContent variant="textMedium" className="text-foreground leading-relaxed">
          Let&apos;s configure your furniture alerts. You can pick multiple categories at once.
        </TextContent>
        <WizardStepBars filledBars={1} />
        <TextContent variant="textMedium" className="font-medium text-foreground">
          Step 1: Pick Categories
        </TextContent>
        <div className="flex flex-wrap gap-2">
          {MOBELABO_CATEGORIES.map((cat) => {
            const selected = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={cn(
                  'rounded-full border border-foreground px-3 py-2 text-sm font-medium transition-colors',
                  selected
                    ? 'bg-[hsl(var(--tertiary))] text-text-inverse border-[hsl(var(--tertiary))]'
                    : 'bg-transparent text-foreground hover:bg-muted/50',
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>
        <div className={cn(stepFooterClass, 'flex items-center justify-between gap-3')}>
          <button
            type="button"
            onClick={handleBackRow}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground text-foreground hover:bg-muted/50"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Button
            type="button"
            variant="black"
            className="rounded-full h-10 px-8"
            disabled={selectedCategories.length === 0}
            onClick={() => selectedCategories.length > 0 && onChange({ ...state, step: 'info' })}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'info') {
    return (
      <div className="w-full space-y-4 text-foreground">
        <WizardStepBars filledBars={2} />
        <TextContent variant="textMedium" className="font-medium text-foreground">
          Step 2: Your Info
        </TextContent>
        <div className="space-y-3">
          <div className="flex gap-2 min-w-0">
            <Input
              value={lastName}
              onChange={(e) => onChange({ ...state, lastName: e.target.value })}
              placeholder="Name"
              className="flex-1 min-w-0 rounded-2xl border-foreground text-sm h-10"
            />
            <Input
              value={firstName}
              onChange={(e) => onChange({ ...state, firstName: e.target.value })}
              placeholder="First Name"
              className="flex-1 min-w-0 rounded-2xl border-foreground text-sm h-10"
            />
          </div>
          <Input
            type="email"
            value={email}
            onChange={(e) => onChange({ ...state, email: e.target.value })}
            placeholder="Email"
            autoComplete="email"
            className="rounded-2xl border-foreground text-sm h-10"
          />
        </div>
        <div className={cn(stepFooterClass, 'flex items-center justify-between gap-3')}>
          <button
            type="button"
            onClick={handleBackRow}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground text-foreground hover:bg-muted/50"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Button
            type="button"
            variant="black"
            className="rounded-full h-10 px-6"
            onClick={() => {
              const em = email.trim()
              if (!lastName.trim() || !firstName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
                return
              }
              onChange({ ...state, step: 'confirmation' })
            }}
          >
            Submit Alerts
          </Button>
        </div>
      </div>
    )
  }

  const list =
    selectedCategories.length > 0 ? selectedCategories.join(', ') : 'your categories'

  return (
    <div className="w-full space-y-4 text-foreground">
      <TextContent variant="textMedium" className="text-foreground leading-relaxed whitespace-pre-line">
        {`Successfully saved alerts for ${list}. You'll hear from us soon!`}
      </TextContent>
      <div className={stepFooterClass}>
        <Button type="button" variant="black" className="w-full rounded-full h-10" onClick={() => onChange({ ...state, step: 'categories' })}>
          Adjust Alerts
        </Button>
      </div>
    </div>
  )
}

export default MobelaboFlow
