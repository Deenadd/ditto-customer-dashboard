/**
 * A health policy's renewal, counted in days from today: positive while it's
 * coming up, 0 on the day, negative once the renewal date has passed. Indian
 * health cover gives 30 days' grace after it: the policy and its no-claim
 * bonus can still be renewed without a break, but nothing is covered until
 * it is. Past the grace the policy has lapsed, which is the Inactive tab.
 */
export const RENEWAL_WINDOW = 30;
export const GRACE_DAYS = 30;

/* How far away each card's renewal is when the v2 card is first shown. */
export const defaultRenewalDays: Record<string, number> = {
  "474-981-34EDH20": 18,
  "528-190-47SNR36": 5,
};

export type RenewalStage = "upcoming" | "soon" | "today" | "grace";

export type Renewal = {
  stage: RenewalStage;
  /** Days left: to the renewal date, or, in grace, to the end of the grace. */
  left: number;
  /** How much of the window or grace is left, 0 to 1, for the ring. */
  share: number;
  title: string;
  detail: string;
  /** "Valid till" on the card, as a month and year. */
  validTill: string;
};

const DAY = 86_400_000;
/* Three-letter months, as the cards write them ("Aug 2043", never "Sept"). */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayMonth = (date: Date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`;
const monthYear = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/** The renewal `days` from `today`, or null when it's further off than the window. */
export function renewalOf(days: number, today = new Date()): Renewal | null {
  if (days > RENEWAL_WINDOW || days < -GRACE_DAYS) return null;
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(midnight.getTime() + days * DAY);
  const validTill = monthYear(due);

  if (days < 0) {
    const left = GRACE_DAYS + days;
    const graceEnds = new Date(due.getTime() + GRACE_DAYS * DAY);
    return {
      stage: "grace",
      left,
      share: left / GRACE_DAYS,
      title: left === 0 ? "Last day to renew" : "Renewal overdue",
      detail:
        left === 0
          ? "Renew today to keep your no-claim bonus. New claims aren’t covered until you do."
          : `${left} ${left === 1 ? "day" : "days"} left to renew, until ${dayMonth(graceEnds)}. New claims aren’t covered until you do.`,
      validTill,
    };
  }
  if (days === 0) {
    return { stage: "today", left: 0, share: 0, title: "Renews today", detail: "Renew today so there’s no gap in your cover.", validTill };
  }
  const soon = days <= 7;
  return {
    stage: soon ? "soon" : "upcoming",
    left: days,
    share: days / RENEWAL_WINDOW,
    title: days === 1 ? "Renews tomorrow" : `Renews in ${days} days`,
    detail: soon
      ? `Renew by ${dayMonth(due)} so there’s no gap in your cover.`
      : `Due on ${dayMonth(due)}. Renew early to keep your no-claim bonus.`,
    validTill,
  };
}
