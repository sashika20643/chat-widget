import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/shadCN/button'
import { Input } from '@/components/ui/shadCN/input'
import { TextContent } from '@/components/TextContent'
import { NewsletterSubCategory } from '@/constants/fcaShops'
import {
  createNewsletterSubscriptionForCurrentShop,
  isNewsletterCustomerNotFoundError,
} from '@/services/newsletterApi'
import { cn } from '@/utils/utils'

interface NewsletterFlowProps {
  onSubscribe: (email: string) => Promise<void>
  /** Opens in-chat registration; receives email typed in the newsletter field for prefilling. */
  onRequestRegister?: (prefillEmail: string) => void
  /**
   * `inline` — CTA + steps (intro is omitted when assistant text is empty).
   * `full` — same as inline for the email step (no extra paragraph).
   */
  variant?: 'full' | 'inline'
  /** Called when moving to the second screen — use to drop assistant intro text still stored on the message. */
  onEnterSecondStep?: () => void
}

type Phase = 'email' | 'more_newsletters' | 'complete' | 'needs_registration'

function NewsletterFlow({
  onSubscribe,
  variant = 'full',
  onEnterSecondStep,
  onRequestRegister,
}: NewsletterFlowProps) {
  const [phase, setPhase] = useState<Phase>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [memorie, setMemorie] = useState(false)
  const [viadukt, setViadukt] = useState(false)
  const [completeNote, setCompleteNote] = useState<string | null>(null)
  const [step2Submitting, setStep2Submitting] = useState(false)
  /** Which screen led to the "not registered" prompt (for Back). */
  const [registrationPromptFrom, setRegistrationPromptFrom] = useState<'email' | 'step2'>('email')

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      await onSubscribe(trimmed)
      setError(null)
      setMemorie(true)
      setViadukt(false)
      onEnterSecondStep?.()
      setPhase('more_newsletters')
    } catch (err) {
      if (isNewsletterCustomerNotFoundError(err)) {
        setRegistrationPromptFrom('email')
        setPhase('needs_registration')
        return
      }
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStep2Subscribe() {
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setError(null)

    const subCategories = new Set<number>([NewsletterSubCategory.Bogen33])
    if (memorie) subCategories.add(NewsletterSubCategory.Memorie)
    if (viadukt) subCategories.add(NewsletterSubCategory.Viadukt3)
    const subCategoriesSorted = [...subCategories].sort((a, b) => a - b)

    setStep2Submitting(true)
    try {
      await createNewsletterSubscriptionForCurrentShop(subCategoriesSorted)
      setCompleteNote(
        `Thanks! Check your email for Verification. In the meantime is there
anything else I can assist you with?`,
      )
      setPhase('complete')
    } catch (err) {
      if (isNewsletterCustomerNotFoundError(err)) {
        setRegistrationPromptFrom('step2')
        setPhase('needs_registration')
        return
      }
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setStep2Submitting(false)
    }
  }

  function handleNoThanks() {
    setCompleteNote(
      `No problem! In the meantime is there
anything else I can assist you with?`,
    )
    setPhase('complete')
  }

  const emailFields = (
    <div className="w-full space-y-2">
      <div className="flex flex-row gap-2 items-center w-full min-w-0">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          autoComplete="email"
          disabled={submitting}
          className="flex-1 min-w-0 h-9 text-sm text-foreground rounded-full border-foreground"
        />
        <Button
          type="submit"
          disabled={submitting}
          variant="black"
          className="flex-shrink-0 h-9 rounded-full px-4 whitespace-nowrap"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing…
            </span>
          ) : (
            'Subscribe'
          )}
        </Button>
      </div>
      {error && phase === 'email' ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )

  if (phase === 'needs_registration') {
    return (
      <div className={cn('w-full space-y-3', variant === 'inline' && 'mt-3')}>
        <TextContent variant="textMedium" className="text-foreground">
          You are not registered.
        </TextContent>
        <div className="flex flex-row flex-wrap gap-2 w-full">
          <Button
            type="button"
            variant="black"
            className="h-9 rounded-full px-4"
            onClick={() => onRequestRegister?.(email.trim())}
          >
            Register
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full px-4 border-foreground bg-transparent text-foreground shadow-none hover:bg-muted/50"
            onClick={() => {
              setError(null)
              setPhase(registrationPromptFrom === 'step2' ? 'more_newsletters' : 'email')
            }}
          >
            Back
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'complete' && completeNote) {
    return (
      <div className={cn('w-full', variant === 'inline' && 'mt-3')}>
        <TextContent variant="textMedium" className="text-foreground whitespace-pre-line">
          {completeNote}
        </TextContent>
      </div>
    )
  }

  if (phase === 'more_newsletters') {
    return (
      <div className={cn('w-full space-y-4', variant === 'inline' && 'mt-3')}>
        <TextContent variant="textMedium" className="text-foreground leading-relaxed whitespace-pre-line">
          {`Thanks! Check your email for Verification. Discover more Newsletters from H100 - Das Möbelhaus:`}
        </TextContent>

        <div className="space-y-3">
          <p className="text-[13px] sm:text-[14px] text-foreground leading-relaxed">
            <span className="underline">Memorie.ch</span>
            {`: Design classics from the 1930s to the 1980s & new European design.`}
          </p>
          <p className="text-[13px] sm:text-[14px] text-foreground leading-relaxed">
            <span className="underline">Viadukt*3</span>
            {`: Specialist in classic Wooden furniture & antique tables`}
          </p>
        </div>

        {/* 12px gap between email field and stacked checkboxes (gap-3 = 0.75rem) */}
        <div className="flex flex-row gap-3 items-start w-full min-w-0">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            disabled={step2Submitting}
            className="flex-1 min-w-0 h-9 text-sm text-foreground rounded-full border-foreground"
          />
          <div className="flex flex-col gap-2 shrink-0 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground whitespace-nowrap">
              <input
                type="checkbox"
                checked={memorie}
                onChange={(e) => setMemorie(e.target.checked)}
                disabled={step2Submitting}
                className="h-4 w-4 rounded border-foreground accent-[hsl(var(--tertiary))]"
              />
              <span>Memorie.ch</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground whitespace-nowrap">
              <input
                type="checkbox"
                checked={viadukt}
                onChange={(e) => setViadukt(e.target.checked)}
                disabled={step2Submitting}
                className="h-4 w-4 rounded border-foreground accent-[hsl(var(--tertiary))]"
              />
              <span>Viadukt*3</span>
            </label>
          </div>
        </div>

        {error && phase === 'more_newsletters' ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-row flex-wrap gap-2 w-full">
          <Button
            type="button"
            variant="black"
            className="flex-1 min-w-[120px] h-9 rounded-full"
            disabled={step2Submitting}
            onClick={() => void handleStep2Subscribe()}
          >
            {step2Submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subscribing…
              </span>
            ) : (
              'Subscribe'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-w-[120px] h-9 rounded-full border-foreground bg-transparent text-foreground shadow-none hover:bg-muted/50"
            disabled={step2Submitting}
            onClick={handleNoThanks}
          >
            No, thanks
          </Button>
        </div>
      </div>
    )
  }

  const formClass = cn('w-full space-y-3', variant === 'inline' && 'mt-3')

  if (variant === 'inline') {
    return (
      <form onSubmit={(e) => void handleEmailSubmit(e)} className={formClass}>
        {emailFields}
      </form>
    )
  }

  return (
    <form onSubmit={(e) => void handleEmailSubmit(e)} className={formClass}>
      {emailFields}
    </form>
  )
}

export default NewsletterFlow
