import { cn } from '@/utils/utils'

export interface ButtonTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'div'
}

/** Button text – 17pt (~23px), aligned with body large */
export function ButtonText({ className, as: Comp = 'span', ...props }: ButtonTextProps) {
  return (
    <Comp
      className={cn('text-lg lg:text-[23px] font-medium', className)}
      {...props}
    />
  )
}
