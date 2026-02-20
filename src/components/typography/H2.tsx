import { cn } from '@/utils/utils'

export interface H2Props extends React.HTMLAttributes<HTMLElement> {
  as?: 'h2' | 'h3' | 'div'
}

/** Section title – 20pt (~27px) */
export function H2({ className, as: Comp = 'h2', ...props }: H2Props) {
  return (
    <Comp
      className={cn('text-2xl lg:text-[27px] font-medium', className)}
      {...props}
    />
  )
}
