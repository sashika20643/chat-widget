import type { ReactNode } from "react";

const variantStyles = {
  textLarge:
    "text-text-primary text-[20px] lg:text-[24px] xl:text-[32px] leading-7 lg:leading-8",
  textMedium:
    "text-text-primary text-sm lg:text-base xl:text-lg leading-6 lg:leading-7",
  buttonText:
    "text-text-primary text-[18px] lg:text-[20px] leading-5 lg:leading-6",
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
