import { cn } from '@/utils/utils'

export interface SmallProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'label'
}

/** Small label – 15pt (~20px) */
export function Small({ className, as: Comp = 'p', ...props }: SmallProps) {
  return (
    <Comp
      className={cn('text-base lg:text-[20px] font-medium', className)}
      {...props}
    />
  )
}
