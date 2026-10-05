import type { ComponentPropsWithRef } from "react";

type Variant = "filled" | "tinted" | "plain" | "destructive";
type Size = "small" | "medium" | "large";

const variants: Record<Variant, string> = {
  filled: "bg-accent text-white [@media(hover:hover)]:hover:bg-accent-hover",
  tinted: "bg-accent-tint text-accent-text [@media(hover:hover)]:hover:bg-[#dcebfb]",
  /* Ghost: no fill, ever. It dims on hover and press instead. */
  plain: "text-accent-text active:opacity-50 [@media(hover:hover)]:hover:opacity-70",
  /* For the one irreversible action in a confirmation; white on #c41e3a is 5.6:1. */
  destructive: "bg-red-text text-white [@media(hover:hover)]:hover:bg-[#a8182f]",
};

const sizes: Record<Size, string> = {
  small: "h-8 px-3.5 text-[14px] gap-1.5",
  medium: "h-9 px-4 text-[15px] gap-1.5",
  large: "h-12 px-6 text-[17px] gap-2",
};

/** Class list for anything that should look like a button, links too. */
export function buttonClass(variant: Variant = "filled", size: Size = "medium") {
  return `inline-flex shrink-0 items-center justify-center rounded-control font-medium leading-none tracking-[-0.01em] whitespace-nowrap select-none transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.96] ${variants[variant]} ${sizes[size]}`;
}

/**
 * Button with the input field's 14px corners. Filled is the one primary
 * action in a view; tinted and plain are its quieter peers. Presses scale.
 */
export function Button({
  variant = "filled",
  size = "medium",
  className = "",
  type = "button",
  ...props
}: ComponentPropsWithRef<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}
