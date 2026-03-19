import { File } from 'lucide-react'
import { cn } from '@/utils/utils'

interface FilePreviewProps {
  file: File
  className?: string
}

export function FilePreview({ file, className }: FilePreviewProps) {
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm',
        className
      )}
    >
      <File className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="truncate font-medium text-foreground">{file.name}</span>
        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
      </div>
    </div>
  )
}

