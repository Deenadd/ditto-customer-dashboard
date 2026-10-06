import {
  Activity,
  ArrowLeft,
  Check,
  ChevronRight,
  CircleHelp,
  Clock,
  Globe,
  Hospital,
  IdCard,
  FilePlus2,
  Files,
  MapPin,
  Navigation,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";

/**
 * Every interface icon comes from here, so the set can change in one place.
 * They draw in currentColor at a 1.75 stroke, which sits with the 15px
 * medium labels beside them, and are decorative unless given a title.
 *
 * Central Icons (centralicons.com) is the intended set. Its React packages
 * are licensed and check CENTRAL_LICENSE_KEY on install; once that key is
 * set here and on Vercel, swap each wrapper below for its Central icon.
 */
export type IconProps = { size?: number; className?: string };
export type Icon = (props: IconProps) => React.JSX.Element;

function from(Glyph: LucideIcon, strokeWidth = 1.75): Icon {
  function Wrapped({ size = 20, className }: IconProps) {
    return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden className={className} />;
  }
  Wrapped.displayName = `Icon(${Glyph.displayName ?? "glyph"})`;
  return Wrapped;
}

export const IconClaim = from(FilePlus2);
export const IconDocuments = from(Files);
export const IconCovered = from(ShieldCheck);
export const IconTrack = from(Activity);
export const IconClose = from(X);
export const IconCheck = from(Check, 2.25);
export const IconBack = from(ArrowLeft);
export const IconChevronRight = from(ChevronRight);
export const IconRestart = from(RotateCcw);
export const IconPhone = from(Phone);
export const IconHospital = from(Hospital);
export const IconExcluded = from(ShieldX);
export const IconHelp = from(CircleHelp);
export const IconHealthCard = from(IdCard);
export const IconTrash = from(Trash2);
export const IconDirections = from(Navigation);
export const IconWebsite = from(Globe);
export const IconClock = from(Clock);
export const IconPin = from(MapPin);
