import { Button } from '@/components/ui/shadCN/button'
import { TextContent } from '@/components/TextContent'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'

interface WelcomeScreenProps {
  onTagClick: (tag: string) => void
}

function WelcomeScreen({ onTagClick }: WelcomeScreenProps) {
  const tags = [
    '📸🪑Take Photo',
    '🖼️🪑Upload Image',
    '🤝B2B Project',
    '🎨Furniture Consultation'
  ]

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center text-center max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-2">
          <img 
            src={H100Icon} 
            alt="H100 AI" 
            className="h-16 w-16 lg:h-[66px] lg:w-[66px] object-contain"
          />
        </div>

        {/* Main Message */}
        <TextContent variant="textLarge" className="text-foreground leading-relaxed">
          Hi, I'm your personal <br /> H100 personal assistant.
        </TextContent>

        {/* Sub Message */}
        <TextContent variant="textMedium"  className="text-muted-foreground">
          Please state your request
        </TextContent>

        {/* Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 w-full mt-4">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              onClick={() => onTagClick(tag)}
              className=" px-3.5 lg:px-4 py-3 lg:py-3 rounded-full rounded-17px lg:rounded-[20px] border border-border hover:bg-[hsl(var(--gray-50))]"
            >
                      <TextContent variant="textMedium" >

              {tag}
              </TextContent>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

