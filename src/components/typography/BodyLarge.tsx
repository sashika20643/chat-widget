import { cn } from '@/utils/utils'

export interface BodyLargeProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div'
}

/** Chat message / body large – 17pt (~23px) */
export function BodyLarge({ className, as: Comp = 'p', ...props }: BodyLargeProps) {
  return (
    <Comp
      className={cn('text-xl lg:text-[23px] font-medium', className)}
      {...props}
    />
  )
}
