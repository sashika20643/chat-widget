import { useRef } from 'react'
import { Button } from '@/components/ui/shadCN/button'
import { TextContent } from '@/components/TextContent'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'

const TAG_TAKE_PHOTO = '📸🪑Take Photo'
const TAG_UPLOAD_IMAGE = '🖼️🪑Upload Image'

interface WelcomeScreenProps {
  onTagClick: (tag: string) => void
  onWelcomeImageFiles: (files: File[]) => void | Promise<void>
  isBusy?: boolean
}

function WelcomeScreen({ onTagClick, onWelcomeImageFiles, isBusy }: WelcomeScreenProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const tags = [
    TAG_TAKE_PHOTO,
    TAG_UPLOAD_IMAGE,
    '🤝B2B Project',
    '🎨Furniture Consultation',
  ]

  function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    const inputEl = event.target
    if (!files?.length) return
    void onWelcomeImageFiles(Array.from(files))
    inputEl.value = ''
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center text-center max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-2">
          <img 
            src={H100Icon} 
            alt="H100 AI" 
            className="h-[66px] w-[66px] object-contain"
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

        {/* Gallery / camera file pickers (same pattern as ChatInputBar) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleGalleryChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleGalleryChange}
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 w-full mt-4">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => {
                if (tag === TAG_TAKE_PHOTO) {
                  cameraInputRef.current?.click()
                  return
                }
                if (tag === TAG_UPLOAD_IMAGE) {
                  galleryInputRef.current?.click()
                  return
                }
                onTagClick(tag)
              }}
              className=" px-3.5 lg:px-4 py-3 lg:py-3 rounded-full rounded-17px lg:rounded-[20px] border border-border hover:bg-[hsl(var(--gray-50))]"
            >
              <TextContent variant="textMedium">{tag}</TextContent>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

