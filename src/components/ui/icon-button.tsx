import { Button, type ButtonProps } from "@/components/ui/shadCN/button"
import { cn } from "@/utils/utils"

export interface IconButtonProps extends ButtonProps {
  icon: string | React.ReactNode
  "aria-label": string
}

function IconButton({ 
  className, 
  variant = "ghost", 
  size = "icon", 
  icon, 
  children, 
  ...props 
}: IconButtonProps) {
  const iconElement = typeof icon === "string" ? (
    <img src={icon} alt={props["aria-label"]} className={cn("h-full w-full object-contain", className?.includes("rotate") && className)} />
  ) : (
    icon
  )

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-full p-0", className)}
      {...props}
    >
      {iconElement}
      {children}
    </Button>
  )
}

export { IconButton }

