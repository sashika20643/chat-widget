import { cn } from '@/utils/utils'

export interface BodyProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div'
}

/** Form text / body – 16pt (~21px) */
export function Body({ className, as: Comp = 'p', ...props }: BodyProps) {
  return (
    <Comp
      className={cn('text-lg lg:text-[21px] font-medium', className)}
      {...props}
    />
  )
}
