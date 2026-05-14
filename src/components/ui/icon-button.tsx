import { Button, type ButtonProps } from "@/components/ui/shadCN/button"
import { cn } from "@/utils/utils"

export type IconButtonSize =
  | NonNullable<ButtonProps["size"]>
  | "mlarge"
  | "xl"
  | "bubble"

const iconButtonSizeClasses: Record<IconButtonSize, string> = {
  default: "h-30 w-30 lg:h-35 lg:w-35",
  sm: "h-10 w-10 lg:h-11 lg:w-11",
  lg: "h-10 w-10",
  icon: "h-9 w-9",
  mlarge: "h-[44px] w-[44px]",
  xl: "h-[58px] w-[58px] lg:h-[69px] lg:w-[69px]",
  bubble: "h-8 w-8 sm:h-37 sm:w-37",
}

export interface IconButtonProps
  extends Omit<ButtonProps, "variant" | "size"> {
  icon: string | React.ReactNode
  "aria-label": string
  variant?: ButtonProps["variant"] | "header"
  size?: IconButtonSize
}

function IconButton({
  className,
  variant = "ghost",
  size = "icon",
  icon,
  children,
  ...props
}: IconButtonProps) {
  const isHeaderVariant = variant === "header"
  const buttonVariant = isHeaderVariant ? "ghost" : variant
  const sizeClasses = size ? iconButtonSizeClasses[size] : iconButtonSizeClasses.icon
  const buttonSize: ButtonProps["size"] =
    size === "default" || size === "sm" || size === "lg" || size === "icon"
      ? size
      : "icon"

  const iconElement =
    typeof icon === "string" ? (
      <img
        src={icon}
        alt={props["aria-label"]}
        className={cn(
          "h-full w-full object-contain",
          className?.includes("rotate") && className
        )}
      />
    ) : (
      icon
    )

  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      className={cn(
        "rounded-full p-0",
        sizeClasses,
        className
      )}
      {...props}
    >
      {iconElement}
      {children}
    </Button>
  )
}

export { IconButton }

