import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/shadCN/button'
import { Input } from '@/components/ui/shadCN/input'
import { TextContent } from '@/components/TextContent'
import type { AuthLoginWizardState } from '@/types/chat'

interface LoginAuthFormProps {
  state: AuthLoginWizardState
  onChange: (next: AuthLoginWizardState) => void
  onSubmit: () => void | Promise<void>
}

function LoginAuthForm({ state, onChange, onSubmit }: LoginAuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const email = state.email ?? ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <TextContent variant="textMedium" className="text-foreground mb-4">
        Enter your email. We will send you a magic sign-in link.
      </TextContent>

      {state.submitError ? (
        <TextContent variant="textSmall" className="mb-3 text-destructive font-medium">
          {state.submitError}
        </TextContent>
      ) : null}

      <div className="space-y-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => onChange({ ...state, email: e.target.value, submitError: undefined })}
          placeholder="Email"
          required
          autoComplete="email"
          className="text-base text-foreground rounded-2xl"
        />
      </div>

      <Button
        type="submit"
        variant="black"
        size="sm"
        className="mt-4 pl-2 rounded-full px-4 py-3"
        disabled={!email.trim() || isSubmitting}
      >
        <span className="flex items-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <TextContent variant="buttonText" className="text-text-inverse">
            Send magic link
          </TextContent>
        </span>
      </Button>
    </form>
  )
}

export default LoginAuthForm
