"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LostState } from "@/components/lost-state";
import { Button, buttonClass } from "@/components/ui/buttons";
import { IconAlert } from "@/components/ui/icons";

/**
 * The error boundary: a page that broke while loading or drawing. Nothing
 * you've sent is lost (claims are kept in this browser), so it says so, and
 * offers Try again, which re-renders the page, and the way home.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.warn("Page error:", error.digest ?? error.message);
  }, [error]);

  return (
    <LostState
      icon={IconAlert}
      tone="red"
      title="This page didn't load"
      actions={
        <>
          <Button size="large" className="w-full" onClick={reset}>
            Try again
          </Button>
          <Link href="/dashboard" className={`${buttonClass("plain", "large")} w-full`}>
            Go to your policies
          </Link>
        </>
      }
    >
      Something went wrong on our side. Your policies and claims are safe. Try again, and if it keeps happening, start from
      your policies.
    </LostState>
  );
}
