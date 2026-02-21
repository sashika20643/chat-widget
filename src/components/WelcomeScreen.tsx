import { Button } from '@/components/ui/shadCN/button'
import { BodyLarge, H1 } from '@/components/typography'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'

interface WelcomeScreenProps {
  onTagClick: (tag: string) => void
}

function WelcomeScreen({ onTagClick }: WelcomeScreenProps) {
  const tags = [
    'Furniture scanning',
    'About H100',
    'Gastro',
    'My Perfect Furniture'
  ]

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center text-center max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-2">
          <img 
            src={H100Icon} 
            alt="H100 AI" 
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
          />
        </div>

        {/* Main Message */}
        <H1 className="text-foreground leading-relaxed">
          Hi, I'm your personal <br/> H100 personal assistant.
        </H1>

        {/* Sub Message */}
        <BodyLarge className="text-muted-foreground">
          Please state your request
        </BodyLarge>

        {/* Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full mt-4">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              onClick={() => onTagClick(tag)}
              className="text-sm lg:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-full lg:rounded-3xl border border-[hsl(var(--tertiary))] hover:bg-[hsl(var(--gray-50))]"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

