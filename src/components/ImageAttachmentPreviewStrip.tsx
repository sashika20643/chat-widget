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
    <div className="px-2 pt-3 pb-2 rounded-[12px]">
      <div className="flex items-start gap-2 overflow-x-auto pt-2 pl-3 pr-1">
        {attachments.map((a) => (
          <div
            key={a.id}
            className="relative h-[62px] w-[62px] bg-background flex-shrink-0"
          >
            <img
              src={a.previewUrl}
              alt={a.fileName}
              className="absolute bottom-0 right-0 h-[56px] w-[56px] rounded-md object-cover border border-border"
            />

            {/* Status */}
            {a.status === 'uploading' && (
              <div className="absolute bottom-1 left-2 text-[9px] px-1.5 py-0.5 rounded bg-background/80 text-foreground">
                Upload
              </div>
            )}
            {a.status === 'error' && (
              <div className="absolute bottom-1 left-2 text-[9px] px-1.5 py-0.5 rounded bg-destructive/20 text-foreground">
                Error
              </div>
            )}

            {/* Remove (top-left, half outside) */}
            <button
              type="button"
              className="absolute left-[6px] top-[6px] z-30 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background flex items-center justify-center text-foreground"
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

