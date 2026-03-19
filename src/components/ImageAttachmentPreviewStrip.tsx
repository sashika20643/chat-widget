import { X } from 'lucide-react'

export type ImageAttachmentPreview = {
  id: string
  fileName: string
  previewUrl: string
  uploadedUrl?: string
  status: 'uploading' | 'ready' | 'error'
  error?: string
}

interface ImageAttachmentPreviewStripProps {
  attachments: ImageAttachmentPreview[]
  onRemove: (id: string) => void
}

export function ImageAttachmentPreviewStrip({
  attachments,
  onRemove,
}: ImageAttachmentPreviewStripProps) {
  if (attachments.length === 0) return null

  return (
    <div className="px-2 pt-1 pb-2 rounded-[12px]">
      <div className="flex items-start gap-2 overflow-x-auto">
        {attachments.map((a) => (
          <div
            key={a.id}
            className="relative h-[44px] w-[44px] rounded-md overflow-hidden bg-background flex-shrink-0"
          >
            <img src={a.previewUrl} alt={a.fileName} className="h-full w-full object-cover" />

            {/* Status */}
            {a.status === 'uploading' && (
              <div className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-background/80 text-foreground">
                Upload
              </div>
            )}
            {a.status === 'error' && (
              <div className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-destructive/20 text-foreground">
                Error
              </div>
            )}

            {/* Remove (top-right) */}
            <button
              type="button"
              className="absolute top-1 right-1 z-30 h-5 w-5 rounded-full bg-background flex items-center justify-center text-foreground"
              aria-label="Remove image"
              onClick={() => onRemove(a.id)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

