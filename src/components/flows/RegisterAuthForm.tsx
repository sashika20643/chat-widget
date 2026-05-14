import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/shadCN/button'
import { Input } from '@/components/ui/shadCN/input'
import { TextContent } from '@/components/TextContent'
import type { AuthRegisterWizardState } from '@/types/chat'

interface RegisterAuthFormProps {
  state: AuthRegisterWizardState
  onChange: (next: AuthRegisterWizardState) => void
  onSubmit: () => void | Promise<void>
}

function RegisterAuthForm({ state, onChange, onSubmit }: RegisterAuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const { email, firstName, name, zip } = state
    if (!email.trim() || !firstName.trim() || !name.trim() || !zip.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    Boolean(state.email.trim()) &&
    Boolean(state.firstName.trim()) &&
    Boolean(state.name.trim()) &&
    Boolean(state.zip.trim())

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <TextContent variant="textMedium" className="text-foreground mb-4">
        Create your account by filling in the details below.
      </TextContent>

      {state.submitError ? (
        <TextContent variant="textSmall" className="mb-3 text-destructive font-medium">
          {state.submitError}
        </TextContent>
      ) : null}
      <div className="space-y-3">
        <Input
          type="email"
          value={state.email}
          onChange={(e) => onChange({ ...state, email: e.target.value })}
          placeholder="Email"
          required
          autoComplete="email"
          className="text-base text-foreground rounded-2xl"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            value={state.firstName}
            onChange={(e) => onChange({ ...state, firstName: e.target.value })}
            placeholder="First name"
            required
            autoComplete="given-name"
            className="text-base text-foreground rounded-2xl"
          />

          <Input
            type="text"
            value={state.name}
            onChange={(e) => onChange({ ...state, name: e.target.value })}
            placeholder="Name"
            required
            autoComplete="family-name"
            className="text-base text-foreground rounded-2xl"
          />
        </div>

        <Input
          type="text"
          inputMode="numeric"
          value={state.zip}
          onChange={(e) => onChange({ ...state, zip: e.target.value })}
          placeholder="ZIP / Postal code"
          required
          autoComplete="postal-code"
          className="text-base text-foreground rounded-2xl"
        />
      </div>

      <Button
        type="submit"
        variant="black"
        size="sm"
        className="mt-4 pl-2 rounded-full px-4 py-3"
        disabled={!canSubmit || isSubmitting}
      >
        <span className="flex items-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <TextContent variant="buttonText" className="text-text-inverse">
            Register
          </TextContent>
        </span>
      </Button>
    </form>
  )
}

export default RegisterAuthForm
