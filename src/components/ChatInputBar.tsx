import { useEffect, useRef, useState } from 'react'
import { Send, Plus, X } from 'lucide-react'
import { useAutoResizeTextarea } from '@/hooks'
import { Button } from '@/components/ui/shadCN/button'
import { cn } from '@/utils/utils'
import { IconButton } from '@/components/ui/icon-button'
import GalleryIcon from '@/assets/icons/Gallery Icon.svg'
import CameraIcon from '@/assets/icons/Camera Icon.svg'
import { uploadImageToImgBB } from '@/services/imgbbApi'
import { ImageAttachmentPreviewStrip, type ImageAttachmentPreview } from '@/components/ImageAttachmentPreviewStrip'

interface ChatInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: (textOverride?: string, imageUrls?: string[]) => void | Promise<void>
  placeholder?: string
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

function ChatInputBar({ 
  value, 
  onChange, 
  onSend, 
  placeholder = 'Type your message...',
  onKeyDown,
}: ChatInputBarProps) {
  const textareaRef = useAutoResizeTextarea(value, {
    minHeightPx: 44,
    maxHeightRatio: 0.4,
  })

  const [mobileIconsOpen, setMobileIconsOpen] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const [attachments, setAttachments] = useState<ImageAttachmentPreview[]>([])

  const attachmentsRef = useRef(attachments)
  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  useEffect(() => {
    return () => {
      for (const a of attachmentsRef.current) {
        try {
          URL.revokeObjectURL(a.previewUrl)
        } catch {}
      }
    }
  }, [])

  const isUploading = attachments.some((a) => a.status === 'uploading')
  const uploadedUrls = attachments.map((a) => a.uploadedUrl).filter((u): u is string => !!u)

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSendClick()
      return
    }
    onKeyDown?.(event)
  }

  function handleGalleryClick() {
    galleryInputRef.current?.click()
  }

  function handleCameraClick() {
    cameraInputRef.current?.click()
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return
    const inputEl = event.target
    const list = Array.from(files)

    const newAttachments = list.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      return {
        id: `${Date.now()}-${file.name}`,
        fileName: file.name,
        previewUrl,
        status: 'uploading' as const,
      }
    })

    setAttachments((prev) => [...prev, ...newAttachments])

    // Upload in parallel; update each attachment independently.
    void Promise.all(
      list.map(async (file, i) => {
        const attachmentId = newAttachments[i]?.id
        if (!attachmentId) return
        try {
          const url = await uploadImageToImgBB(file)
          setAttachments((prev) =>
            prev.map((a) => (a.id === attachmentId ? { ...a, uploadedUrl: url, status: 'ready', error: undefined } : a))
          )
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Upload failed'
          setAttachments((prev) =>
            prev.map((a) => (a.id === attachmentId ? { ...a, status: 'error', error: msg } : a))
          )
        }
      })
    ).finally(() => {
      // Reset file input so selecting the same file again triggers `onChange`
      inputEl.value = ''
    })
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const found = prev.find((a) => a.id === id)
      if (found) {
        try {
          URL.revokeObjectURL(found.previewUrl)
        } catch {}
      }
      return prev.filter((a) => a.id !== id)
    })
  }

  async function handleSendClick() {
    if (isUploading) return

    const base = value.trim()
    const hasImages = uploadedUrls.length > 0
    if (!base && !hasImages) return

    const imageUrlsToSend = uploadedUrls
    // Clear previews immediately to avoid async/race issues.
    setAttachments((prev) => {
      for (const a of prev) {
        try {
          URL.revokeObjectURL(a.previewUrl)
        } catch {}
      }
      return []
    })

    // Keep the file pickers usable for re-selecting the same image(s).
    if (galleryInputRef.current) galleryInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''

    await onSend(base, imageUrlsToSend)
  }

  return (
    <div className="p-4 lg:p-5 lg:pt-1 flex-shrink-0">
      {/* Hidden inputs used for gallery (file picker) and camera capture */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFilesSelected}
      />
      <div className="flex items-end gap-2 lg:gap-2">
        {/* Mobile: + only; tap to show Gallery, AR, Camera. Desktop: always show three icons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile: + button; tap to show vertical popup with three icons */}
          <div className="relative flex lg:hidden items-center">
            <IconButton
              icon={<Plus className="h-12 w-12" />}
              aria-label="Show more options"
              size="mlarge"
              className="border border-border bg-transparent hover:bg-transparent active:bg-transparent [&_svg]:h-6 [&_svg]:w-6"
              onClick={() => setMobileIconsOpen((open) => !open)}
            />
            {mobileIconsOpen && (
              <div
                className="absolute bottom-full left-0 mb-1.5 flex flex-col rounded-md bg-background p-2 shadow-lg"
                role="dialog"
                aria-label="Attach options"
              >
                <div className="flex items-center justify-end pb-1.5 mb-1.5">
                  <IconButton
                    icon={<X className="h-5 w-5" />}
                    aria-label="Close"
                    size="sm"
                    onClick={() => setMobileIconsOpen(false)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <IconButton
                    icon={GalleryIcon}
                    aria-label="Gallery"
                    size="sm"
                    onClick={() => {
                      setMobileIconsOpen(false)
                      handleGalleryClick()
                    }}
                  />
                  {/* <IconButton
                    icon={ARIcon}
                    aria-label="AR"
                    size="sm"
                    onClick={() => setMobileIconsOpen(false)}
                  /> */}
                  <IconButton
                    icon={CameraIcon}
                    aria-label="Camera"
                    size="sm"
                    onClick={() => {
                      setMobileIconsOpen(false)
                      handleCameraClick()
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Desktop: always show three icons */}
          <div className="hidden sm:flex items-center gap-2">
            <IconButton
              icon={GalleryIcon}
              aria-label="Gallery"
              size="sm"
              onClick={handleGalleryClick}
            />
            {/* <IconButton
              icon={ARIcon}
              aria-label="AR"
              size="sm"
            /> */}
            <IconButton
              icon={CameraIcon}
              aria-label="Camera"
              size="sm"
              onClick={handleCameraClick}
            />
          </div>
        </div>

        {/* Input + image preview strip */}
        <div className="flex flex-col flex-1 min-w-0">
          <ImageAttachmentPreviewStrip attachments={attachments} onRemove={removeAttachment} />

          {/* Input box + Send (stable height) */}
          <div className="flex min-h-[50px] border border-border rounded-[28px] overflow-hidden px-[10.5px] items-center">
            <div className="flex items-center w-full">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className={cn(
                'flex-1 min-w-0 min-h-0 resize-none overflow-y-auto border-0 bg-transparent px-3 py-2 text-base shadow-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 lg:text-sm',
                '[scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0'
              )}
              style={{ maxHeight: '40vh' }}
            />
            <Button
              onClick={() => void handleSendClick()}
              size="icon"
              variant="ghost"
              disabled={
                isUploading ||
                (!value.trim() && uploadedUrls.length === 0)
              }
              className="h-[30px] w-[30px] flex-shrink-0 mb-0 rounded-full bg-transparent hover:bg-transparent border border-border p-0 flex items-center justify-center lg:h-[40px] lg:w-[40px]"
            >
              <Send className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInputBar

