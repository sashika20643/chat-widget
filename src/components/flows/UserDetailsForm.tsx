import { useState } from 'react'
import { Button } from '@/components/ui/shadCN/button'
import { Input } from '@/components/ui/shadCN/input'

interface UserDetailsFormProps {
  onSubmit: (details: { name: string; email: string; phone: string }) => void
}

function UserDetailsForm({ onSubmit }: UserDetailsFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name && email && phone) {
      onSubmit({ name, email, phone })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-background border border-[hsl(var(--tertiary))] rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm mb-3">Please provide your details</h3>
      
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Name</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
          className="text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 234 567 8900"
          required
          className="text-sm"
        />
      </div>

      <Button type="submit" variant="black" className="w-full" disabled={!name || !email || !phone}>
        Confirm Appointment
      </Button>
    </form>
  )
}

export default UserDetailsForm

