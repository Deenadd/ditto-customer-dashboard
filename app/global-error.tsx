"use client";

import "./globals.css";
import Link from "next/link";
import { LostState } from "@/components/lost-state";
import { Button, buttonClass } from "@/components/ui/buttons";
import { IconAlert } from "@/components/ui/icons";

/** The last resort, when the root layout itself fails: the same card,
    in its own document. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <LostState
          icon={IconAlert}
          tone="red"
          title="Ditto didn't load"
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
          Something went wrong on our side. Your policies and claims are safe. Try again in a moment.
        </LostState>
      </body>
    </html>
  );
}
