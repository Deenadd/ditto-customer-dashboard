import { buttonClass } from "@/components/ui/buttons";
import { cardClass, cardTitleClass } from "@/components/ui/card-bits";
import { IconCheck, IconClock, IconFile } from "@/components/ui/icons";
import type { Step, StepState } from "@/lib/application-detail";
import { whatsappLink } from "@/lib/whatsapp";

/* A green tick for what's done, a blue clock for what's happening, a grey
   page for what's to come; the rail between two steps takes the colour of
   the step it leaves. */
const dot: Record<StepState, string> = {
  done: "bg-green-dot text-white",
  current: "bg-accent text-white ring-4 ring-accent/15",
  upcoming: "bg-fill-strong text-label-secondary",
};
const rail: Record<StepState, string> = {
  done: "bg-green-dot",
  current: "bg-accent",
  upcoming: "bg-separator",
};
const spoken: Record<StepState, string> = {
  done: ", done",
  current: ", in progress",
  upcoming: ", to come",
};
const glyphs = { done: IconCheck, current: IconClock, upcoming: IconFile };

/**
 * Next steps for you: the three stages of an application down a rail, as
 * far as this one has got, each with what may happen at it. When the
 * insurer is waiting on you, that stage's tile turns orange and offers
 * WhatsApp. The steps arrive one after another, once, in reading order.
 */
export function NextSteps({ steps }: { steps: Step[] }) {
  return (
    <section aria-labelledby="steps-title" className={`${cardClass} p-5`}>
      <h2 id="steps-title" className={cardTitleClass}>
        Next steps for you
      </h2>
      <ol className="mt-4">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          const Glyph = glyphs[step.state];
          return (
            <li
              key={step.title}
              aria-current={step.state === "current" ? "step" : undefined}
              className="relative animate-pop pb-6 pl-9 last:pb-0"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {last ? null : (
                <span aria-hidden className={`absolute top-7 bottom-0 left-[11px] w-0.5 rounded-full ${rail[step.state]}`} />
              )}
              <span aria-hidden className={`absolute top-0 left-0 grid size-6 place-items-center rounded-full ${dot[step.state]}`}>
                <Glyph size={14} />
              </span>
              <h3 className="text-[15px] leading-5 font-semibold text-label">
                {step.title}
                <span className="sr-only">{spoken[step.state]}</span>
              </h3>
              <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">{step.meta}</p>
              <StepTile tile={step.tile} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StepTile({ tile }: { tile: Step["tile"] }) {
  if (tile.needsYou) {
    return (
      <div className="mt-3 rounded-[14px] bg-orange-tint p-3.5">
        <p className="text-[13px] leading-[18px] font-semibold text-pretty text-orange-text">{tile.title}</p>
        <p className="mt-1 text-[13px] leading-[18px] text-pretty text-label">{tile.body}</p>
        <a
          href={whatsappLink(tile.needsYou.message)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass("filled", "small")} mt-3`}
        >
          {tile.needsYou.action}
          <span className="sr-only"> (opens WhatsApp in a new tab)</span>
        </a>
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-[14px] bg-fill-soft p-3.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.04)]">
      <p className="text-[13px] leading-[18px] font-semibold text-pretty text-label">{tile.title}</p>
      {tile.items ? (
        <ol className="mt-1.5 flex flex-col gap-1 text-[13px] leading-[18px] text-label-secondary">
          {tile.items.map((item, index) => (
            <li key={item} className="flex gap-2">
              <span className="w-3.5 shrink-0 tabular-nums">{index + 1}.</span>
              <span className="text-pretty">{item}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {tile.body ? <p className="mt-1 text-[13px] leading-[18px] text-pretty text-label-secondary">{tile.body}</p> : null}
    </div>
  );
}
