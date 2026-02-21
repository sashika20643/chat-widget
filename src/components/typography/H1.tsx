import { cn } from '@/utils/utils'

export interface H1Props extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'div'
}

/** Desktop heading – 24pt (~32px) */
export function H1({ className, as: Comp = 'h1', ...props }: H1Props) {
  return (
    <Comp
      className={cn('text-2xl font-medium', className)}
      {...props}
    />
  )
}
