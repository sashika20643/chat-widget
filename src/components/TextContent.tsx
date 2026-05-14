import type { ReactNode } from "react";

const variantStyles = {
  textLarge:
    "text-text-primary text-[20px] lg:text-[20px] leading-1 lg:leading-8 font-[500]",
  textMedium:
    "text-text-primary text-[15px] lg:text-[14px] leading-1.5 lg:leading-1.6 font-[500]",
  buttonText:
    "text-[14px] lg:text-[15px] leading-5 lg:leading-6 font-[500]",
  textSmall:
    "text-[13px] lg:text-[14px] font-[550] leading-none",
  textCalendar:
    "text-text-primary text-[11px] lg:text-[12px] font-[500] leading-none",
} as const;

export type TextContentVariant = keyof typeof variantStyles;

type TextContentProps = {
  variant: TextContentVariant;
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
};

export function TextContent({
  variant,
  children,
  className = "",
  as: Component = "p",
}: TextContentProps) {
  const baseClasses = variantStyles[variant];
  return (
    <Component className={`${baseClasses} ${className}`.trim()}>
      {children}
    </Component>
  );
}
