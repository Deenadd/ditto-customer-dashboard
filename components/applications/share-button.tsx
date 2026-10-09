"use client";

import { Button } from "@/components/ui/buttons";
import { IconShare } from "@/components/ui/icons";
import { notifySuccess } from "@/components/ui/toast";

/**
 * Share: the phone's own share sheet where there is one; otherwise the link
 * goes to the clipboard with a toast saying so, and failing even that, into
 * a new email.
 */
export function ShareButton({ title, text, path, className = "" }: { title: string; text: string; path: string; className?: string }) {
  const share = async () => {
    const url = new URL(path, window.location.href).toString();
    const data = { title, text, url };
    if (typeof navigator.share === "function" && (typeof navigator.canShare !== "function" || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        /* Closing the sheet isn't a failure. */
        if ((error as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      notifySuccess("Link copied", "Paste it to anyone on the policy.");
    } catch {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${url}`)}`;
    }
  };
  return (
    <Button variant="tinted" size="medium" className={className} onClick={share}>
      <IconShare size={16} />
      Share
    </Button>
  );
}
