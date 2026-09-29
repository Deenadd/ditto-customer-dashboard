import type { ButtonHTMLAttributes } from "react";

type Variant = "filled" | "tinted" | "plain";
type Size = "small" | "medium" | "large";

const variants: Record<Variant, string> = {
  filled: "bg-accent text-white [@media(hover:hover)]:hover:bg-accent-hover",
  tinted: "bg-accent-tint text-accent-text [@media(hover:hover)]:hover:bg-[#dcebfb]",
  plain: "text-accent-text [@media(hover:hover)]:hover:bg-accent-tint",
};

const sizes: Record<Size, string> = {
  small: "h-8 px-3.5 text-[14px] gap-1.5",
  medium: "h-9 px-4 text-[15px] gap-1.5",
  large: "h-12 px-6 text-[17px] gap-2",
};

/** Class list for anything that should look like a pill button, links too. */
export function pillClass(variant: Variant = "filled", size: Size = "medium") {
  return `inline-flex shrink-0 items-center justify-center rounded-full font-medium leading-none tracking-[-0.01em] whitespace-nowrap select-none transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] ${variants[variant]} ${sizes[size]}`;
}

/**
 * Apple-style pill. Filled is the one primary action in a view; tinted and
 * plain are its quieter peers. Presses scale on pointer-down.
 */
export function PillButton({
  variant = "filled",
  size = "medium",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={`${pillClass(variant, size)} ${className}`} {...props} />;
}
