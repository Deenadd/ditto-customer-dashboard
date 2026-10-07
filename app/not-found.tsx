import type { Metadata } from "next";
import Link from "next/link";
import { LostState } from "@/components/lost-state";
import { buttonClass } from "@/components/ui/buttons";
import { IconLost } from "@/components/ui/icons";
import { whatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Page not found — Ditto" };

/** An unknown address, or a policy that isn't on this account. */
export default function NotFound() {
  return (
    <LostState
      icon={IconLost}
      title="This page isn't here"
      actions={
        <>
          <Link href="/dashboard" className={`${buttonClass("filled", "large")} w-full`}>
            Go to your policies
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={`${buttonClass("plain", "large")} w-full`}>
            Ask us on WhatsApp
          </a>
        </>
      }
    >
      The link may be old or mistyped. Your policies and claims are one tap away.
    </LostState>
  );
}
