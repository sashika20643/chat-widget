import { ChevronRight } from 'lucide-react'
import type { GeneralChoiceOption } from '@/types/chat'

const ROWS: { id: GeneralChoiceOption; label: string }[] = [
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'mobelabo', label: 'MÖBELABO' },
  { id: 'search_service', label: 'Search Service' },
  { id: 'furniture_consultation', label: 'Furniture Consultation' },
]

interface GeneralChoiceMenuProps {
  onSelect: (option: GeneralChoiceOption) => void
}

export function GeneralChoiceMenu({ onSelect }: GeneralChoiceMenuProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-[15px] lg:text-sm leading-snug text-foreground">
        <span className="font-medium">You have not found the right thing?</span>{' '}
        We can assist your search if you want:
      </p>
      <div className="flex flex-col gap-2">
        {ROWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="w-full flex items-center justify-between gap-3 rounded-full border border-foreground bg-transparent py-[11.5px] pl-5 pr-3 text-left text-sm text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0 font-medium">{label}</span>
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-foreground"
              aria-hidden
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
