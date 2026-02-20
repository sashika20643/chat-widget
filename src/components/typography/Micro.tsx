import { cn } from '@/utils/utils'

export interface MicroProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'div'
}

/** Micro / metadata – 11pt (~15px) */
export function Micro({ className, as: Comp = 'span', ...props }: MicroProps) {
  return (
    <Comp
      className={cn('text-sm lg:text-[15px] font-medium', className)}
      {...props}
    />
  )
}
