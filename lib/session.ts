/**
 * What this tab remembers between pages (sessionStorage): where sign-in got
 * to, claim drafts, and that you've just logged out. Log out clears the
 * rest, so the next person at this browser starts clean.
 */
export const SIGN_IN_KEY = "ditto.signin";
const SIGNED_OUT_KEY = "ditto.signed-out";
const DRAFT_PREFIX = "ditto.claim-draft.";

export function markSignedOut() {
  try {
    const store = window.sessionStorage;
    for (const key of Object.keys(store)) if (key === SIGN_IN_KEY || key.startsWith(DRAFT_PREFIX)) store.removeItem(key);
    store.setItem(SIGNED_OUT_KEY, "1");
  } catch {
    /* Storage blocked: nothing was kept. */
  }
}

/** Whether you've just logged out. Read it, then `forgetSignedOut`. */
export function justSignedOut() {
  try {
    return window.sessionStorage.getItem(SIGNED_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function forgetSignedOut() {
  try {
    window.sessionStorage.removeItem(SIGNED_OUT_KEY);
  } catch {
    /* Nothing was kept. */
  }
}
