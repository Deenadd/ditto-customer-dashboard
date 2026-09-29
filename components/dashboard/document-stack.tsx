"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Asset } from "@/components/ui/asset";
import { cardClass } from "@/components/ui/card-bits";
import type { SavedDocument } from "@/lib/dashboard-data";

const EXIT_MS = 180;

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Saved documents, reusable across applications. Hovering or focusing a row
 * shows delete and a drag handle (always shown on touch). Rows reorder by
 * dragging, or with the arrow keys on the handle; either way the other rows
 * glide to their new places instead of jumping.
 */
export function DocumentStack({ initial }: { initial: SavedDocument[] }) {
  const [docs, setDocs] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const rows = useRef(new Map<string, HTMLLIElement>());
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const deletes = useRef(new Map<string, HTMLButtonElement>());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const before = useRef(new Map<string, DOMRect>());

  /* FLIP: measure every row before a change, then animate from there. */
  function snapshot() {
    before.current = new Map(
      [...rows.current].map(([id, node]) => [id, node.getBoundingClientRect()]),
    );
  }

  useLayoutEffect(() => {
    if (before.current.size === 0) return;
    const previous = before.current;
    before.current = new Map();
    if (reduceMotion()) return;
    for (const [id, node] of rows.current) {
      const from = previous.get(id);
      if (!from) continue;
      const to = node.getBoundingClientRect();
      const dy = from.top - to.top;
      if (Math.abs(dy) < 1) continue;
      node.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
        duration: 300,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      });
    }
  }, [docs]);

  function reorder(id: string, to: number) {
    const from = docs.findIndex((doc) => doc.id === id);
    if (from < 0 || to < 0 || to >= docs.length || from === to) return null;
    const next = [...docs];
    const [doc] = next.splice(from, 1);
    next.splice(to, 0, doc);
    snapshot();
    setDocs(next);
    return next;
  }

  function announce(id: string, list: SavedDocument[]) {
    const index = list.findIndex((doc) => doc.id === id);
    if (index >= 0) {
      setMessage(`${list[index].title} moved to position ${index + 1} of ${list.length}.`);
    }
  }

  function onHandleKeyDown(event: React.KeyboardEvent, id: string) {
    const index = docs.findIndex((doc) => doc.id === id);
    const targets: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: 0,
      End: docs.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const next = reorder(id, targets[event.key]);
    if (!next) return;
    announce(id, next);
    requestAnimationFrame(() => handles.current.get(id)?.focus());
  }

  function remove(id: string) {
    const index = docs.findIndex((doc) => doc.id === id);
    const doc = docs[index];
    if (!doc || leavingId) return;
    setLeavingId(id);
    window.setTimeout(() => {
      const next = docs.filter((item) => item.id !== id);
      snapshot();
      setDocs(next);
      setLeavingId(null);
      setMessage(`${doc.title} deleted.`);
      const neighbour = next[index] ?? next[index - 1];
      requestAnimationFrame(() => {
        if (neighbour) deletes.current.get(neighbour.id)?.focus();
        else headingRef.current?.focus();
      });
    }, EXIT_MS);
  }

  return (
    <section aria-labelledby="documents-title" className={`${cardClass} pb-2`}>
      <div className="px-5 pt-5">
        <h2
          id="documents-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label"
        >
          Saved documents
        </h2>
        <p className="mt-0.5 text-[13px] leading-[18px] text-label-secondary">
          Reuse them in any application. Drag to reorder.
        </p>
      </div>

      {docs.length === 0 ? (
        <p className="mx-5 mt-4 mb-3 rounded-[14px] bg-fill px-4 py-5 text-[14px] leading-5 text-label-secondary">
          No saved documents. Files you upload for an application are kept
          here to reuse.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-0.5 px-2">
          {docs.map((doc) => {
            const dragging = dragId === doc.id;
            const leaving = leavingId === doc.id;
            return (
              <li
                key={doc.id}
                ref={(node) => {
                  if (node) rows.current.set(doc.id, node);
                  else rows.current.delete(doc.id);
                }}
                draggable
                data-dragging={dragging || undefined}
                onDragStart={(event) => {
                  setDragId(doc.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", doc.title);
                }}
                onDragOver={(event) => {
                  if (!dragId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  if (dragId !== doc.id) {
                    reorder(dragId, docs.findIndex((item) => item.id === doc.id));
                  }
                }}
                onDrop={(event) => event.preventDefault()}
                onDragEnd={() => {
                  if (dragId) announce(dragId, docs);
                  setDragId(null);
                }}
                className={`group relative flex h-16 cursor-grab items-center gap-3 rounded-[14px] px-3 transition-[opacity,scale,background-color,box-shadow] duration-200 ease-out select-none hover:bg-fill focus-within:bg-fill data-[dragging]:cursor-grabbing data-[dragging]:bg-surface data-[dragging]:shadow-raised ${
                  leaving ? "scale-[0.97] opacity-0" : ""
                }`}
              >
                <DocIcon multiPage={doc.multiPage} />

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] leading-5 font-medium text-label">{doc.title}</h3>
                  <p className="truncate text-[13px] leading-[18px] text-label-secondary">
                    {doc.owner}
                    <span aria-hidden className="mx-1.5">
                      ·
                    </span>
                    <span className="sr-only">, </span>
                    {doc.type}
                  </p>
                </div>

                {/* Floats over the end of the text, so names use the full width until
                    the row is hovered or focused. */}
                <div className="absolute inset-y-0 right-1.5 flex items-center rounded-r-[14px] bg-fill pl-1 opacity-0 transition-opacity duration-150 ease-out group-focus-within:opacity-100 group-hover:opacity-100 group-data-[dragging]:bg-surface group-data-[dragging]:opacity-100 before:absolute before:inset-y-0 before:right-full before:w-6 before:bg-linear-to-r before:from-transparent before:to-fill group-data-[dragging]:before:to-surface [@media(hover:none)]:static [@media(hover:none)]:bg-transparent [@media(hover:none)]:opacity-100 [@media(hover:none)]:before:hidden">
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) deletes.current.set(doc.id, node);
                      else deletes.current.delete(doc.id);
                    }}
                    aria-label={`Delete ${doc.title}`}
                    onClick={() => remove(doc.id)}
                    className="grid size-8 place-items-center rounded-full transition-[background-color,transform] duration-150 ease-out active:scale-[0.92] [@media(hover:hover)]:hover:bg-red-tint"
                  >
                    <Asset src="/dashboard/delete.svg" className="h-[14px] w-3" />
                  </button>
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) handles.current.set(doc.id, node);
                      else handles.current.delete(doc.id);
                    }}
                    aria-label={`Move ${doc.title}`}
                    aria-describedby="documents-move-hint"
                    onKeyDown={(event) => onHandleKeyDown(event, doc.id)}
                    className="grid size-8 cursor-grab place-items-center rounded-full transition-colors duration-150 ease-out [@media(hover:hover)]:hover:bg-fill-strong"
                  >
                    <Asset src="/dashboard/drag.svg" className="h-[11.43px] w-2" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p id="documents-move-hint" className="sr-only">
        Use the up and down arrow keys to change the order.
      </p>
      <p role="status" className="sr-only">
        {message}
      </p>
    </section>
  );
}

/** A PDF page on a tile; Income Proof is two pages, stacked as in node 149:8960. */
function DocIcon({ multiPage }: { multiPage?: boolean }) {
  const pages = multiPage
    ? [
        { page: [6.4, 5.4], mark: [11.7, 14.75] },
        { page: [12.4, 8.4], mark: [17.8, 17.75] },
      ]
    : [{ page: [10.4, 7.4], mark: [15.7, 16.75] }];

  return (
    <div
      aria-hidden
      className="relative size-11 shrink-0 rounded-[11px] bg-surface shadow-[0_0_0_0.5px_rgb(0_0_0_/_0.08),0_1px_2px_rgb(0_0_0_/_0.06)]"
    >
      <div className="absolute inset-0 origin-top-left scale-[0.9]">
        {pages.map(({ page, mark }, index) => (
          <div key={index}>
            <Asset
              src="/dashboard/pdf-page.svg"
              className="absolute h-[31.2px] w-[25.05px]"
              style={{ left: page[0], top: page[1] }}
            />
            <Asset
              src="/dashboard/pdf-mark.svg"
              className="absolute h-[15px] w-[14.31px]"
              style={{ left: mark[0], top: mark[1] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
