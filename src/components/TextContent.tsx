import type { ReactNode } from "react";

const variantStyles = {
  textLarge:
    "text-text-primary text-[20px] lg:text-[24px] leading-7 lg:leading-8",
  textMedium:
    "text-text-primary text-[15px] lg:text-[16px] leading-5 lg:leading-6",
  buttonText:
    "text-[14px] lg:text-[15px] leading-5 lg:leading-6",
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
