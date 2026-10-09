import { IconMail, IconPhone } from "@/components/ui/icons";
import { claimsEmail, dittoPhone } from "@/lib/contact";

/** Ditto's phone number and the claims address, as two links in a row. */
export function ContactLinks() {
  const link =
    "touch-hit inline-flex items-center gap-2 rounded-[6px] text-[14px] leading-5 font-medium text-accent-text transition-opacity duration-150 ease-out active:opacity-50 [@media(hover:hover)]:hover:opacity-70";
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      <li>
        <a href={dittoPhone.href} className={link}>
          <IconPhone size={16} className="text-label-secondary" />
          <span className="tabular-nums">{dittoPhone.label}</span>
        </a>
      </li>
      <li>
        <a href={claimsEmail.href} className={link}>
          <IconMail size={16} className="text-label-secondary" />
          {claimsEmail.label}
        </a>
      </li>
    </ul>
  );
}
