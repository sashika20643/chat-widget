import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/shadCN/button'
import { Input } from '@/components/ui/shadCN/input'
import { TextContent } from '@/components/TextContent'
import { cn } from '@/utils/utils'
import { WizardStepBars } from '@/components/flows/WizardStepBars'
import type { SearchServiceWizardState } from '@/types/chat'

const stepFooterClass = 'mt-3 border-t border-border pt-4'

/** Wider than default w-fit bubble so Step 1 inputs use more horizontal space (capped by parent max-w). */
const flowShellClass =
  'w-full min-w-[min(100%,18rem)] sm:min-w-[25rem] max-w-full space-y-4 text-foreground'

const introCopy =
  "With our search service we are actively hunting for you. Because our design pieces are often unique or limited rare. What specific piece of furniture are you looking for?"

interface SearchServiceFlowProps {
  state: SearchServiceWizardState
  onChange: (next: SearchServiceWizardState) => void
}

function SearchServiceFlow({ state, onChange }: SearchServiceFlowProps) {
  const {
    step,
    designer,
    manufacturer,
    model,
    price,
    customerComment,
    lastName,
    firstName,
    email,
  } = state

  function handleBackRow() {
    if (step === 'details') {
      onChange({ ...state, step: 'intro' })
      return
    }
    if (step === 'info') {
      onChange({ ...state, step: 'details' })
      return
    }
    if (step === 'confirmation') {
      onChange({ ...state, step: 'details' })
    }
  }

  if (step === 'intro') {
    return (
      <div className={flowShellClass}>
        <TextContent variant="textMedium" className="text-foreground leading-relaxed">
          {introCopy}
        </TextContent>
        <div className={stepFooterClass}>
          <Button
            type="button"
            variant="black"
            className="w-full rounded-full h-10"
            onClick={() => onChange({ ...state, step: 'details' })}
          >
            Configure
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'details') {
    return (
      <div className={flowShellClass}>
        <WizardStepBars filledBars={1} />
        <TextContent variant="textLarge" className="!font-semibold text-foreground">
          Step 1: Details
        </TextContent>
        <div className="space-y-3">
          <Input
            value={designer}
            onChange={(e) => onChange({ ...state, designer: e.target.value })}
            placeholder="Designer (optional)"
            className="rounded-2xl border-foreground text-sm h-10"
          />
          <Input
            value={manufacturer}
            onChange={(e) => onChange({ ...state, manufacturer: e.target.value })}
            placeholder="Manufacturer (optional)"
            className="rounded-2xl border-foreground text-sm h-10"
          />
          <Input
            value={model}
            onChange={(e) => onChange({ ...state, model: e.target.value })}
            placeholder="Model (optional)"
            className="rounded-2xl border-foreground text-sm h-10"
          />
          <Input
            value={price}
            onChange={(e) => onChange({ ...state, price: e.target.value })}
            placeholder="Price (optional)"
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
            className="rounded-full h-10 px-8"
            onClick={() => onChange({ ...state, step: 'info' })}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'info') {
    return (
      <div className={flowShellClass}>
        <WizardStepBars filledBars={2} />
        <TextContent variant="textLarge" className="!font-semibold text-foreground">
          Step 2: Your Info
        </TextContent>
        <div className="space-y-3">
          <textarea
            value={customerComment}
            onChange={(e) => onChange({ ...state, customerComment: e.target.value })}
            placeholder="Customer Comment (optional)"
            rows={4}
            className="flex min-h-[100px] w-full resize-y rounded-2xl border border-foreground bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
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
            Submit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={flowShellClass}>
      <TextContent variant="textMedium" className="text-foreground leading-relaxed">
        Successfully saved. Thanks for your request. You&apos;ll hear from us soon!
      </TextContent>
      <div className={stepFooterClass}>
        <Button
          type="button"
          variant="black"
          className="w-full rounded-full h-10"
          onClick={() => onChange({ ...state, step: 'details' })}
        >
          Adjust Search Service
        </Button>
      </div>
    </div>
  )
}

export default SearchServiceFlow
