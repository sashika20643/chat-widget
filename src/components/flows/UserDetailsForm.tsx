import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/shadCN/button'
import { Input } from '@/components/ui/shadCN/input'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { TextContent } from '@/components/TextContent'
import { cn } from '@/utils/utils'

interface UserDetailsFormProps {
  onSubmit: (details: { firstName: string; lastName: string; email: string; phone: string; message?: string }) => void
}

function UserDetailsForm({ onSubmit }: UserDetailsFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (firstName && lastName && email && phone) {
      setIsSubmitting(true)
      try {
        await onSubmit({ firstName, lastName, email, phone, message: message || undefined })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <ChatBubble variant="assistant" className="p-4 rounded-3xl w-[83%]">
      <TextContent variant="textMedium" className="text-foreground mb-4">
        Now we just need your contact details. We will only use your data to communicate about the appointment :)
      </TextContent>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            required
            className="text-base text-foreground rounded-2xl"
          />

          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            required
            className="text-base text-foreground rounded-2xl"
          />
        </div>

        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="text-base text-foreground rounded-2xl"
        />

        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          required
          className="text-base text-foreground rounded-2xl"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message (optional)"
          className={cn(
            "flex h-9 w-full rounded-2xl border border-input bg-transparent px-3 py-1 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dark disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          )}
        />
      </div>

      <Button
        type="submit"
        variant="black"
        size="sm"
        className="mt-1 pl-2 rounded-full px-4 py-3"
        disabled={!firstName || !lastName || !email || !phone || isSubmitting}
      >
        <span className="flex items-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <TextContent variant="buttonText" className="text-text-inverse">
            Done
          </TextContent>
        </span>
      </Button>
      </ChatBubble>
    </form>
  )
}

export default UserDetailsForm

