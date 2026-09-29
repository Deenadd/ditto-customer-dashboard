import type { ButtonHTMLAttributes } from "react";

/**
 * Primary/Blue button. `small` is "Button / Primary / Icon left" (32px, the
 * sidebar's Chat now); `large` is the empty state's 44px Learn more.
 */
export function PrimaryButton({
  size = "small",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: "small" | "large" }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center bg-primary font-medium whitespace-nowrap text-white transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-[#2f9fec] ${
        size === "small"
          ? "h-8 rounded-[6px] px-4 text-[14px] leading-5"
          : "h-11 rounded-lg px-[30px] text-[16px] leading-[normal]"
      } ${className}`}
      {...props}
    />
  );
}
