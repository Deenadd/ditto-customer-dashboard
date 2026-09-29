"use client";

import { useRef, useState } from "react";
import { Asset } from "@/components/ui/asset";
import type { SavedDocument } from "@/lib/dashboard-data";

const EXIT_MS = 150;

/**
 * Document Stack (node 149:8955). The Address Proof row in the design shows
 * the hover state: the row lifts onto a white card and a delete button and a
 * drag handle appear. Rows reorder by dragging, or from the keyboard with the
 * arrow keys on the handle.
 */
export function DocumentStack({ initial }: { initial: SavedDocument[] }) {
  const [docs, setDocs] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const deletes = useRef(new Map<string, HTMLButtonElement>());
  const headingRef = useRef<HTMLHeadingElement>(null);

  function move(id: string, to: number) {
    setDocs((current) => {
      const from = current.findIndex((doc) => doc.id === id);
      if (from < 0 || to < 0 || to >= current.length || from === to) return current;
      const next = [...current];
      const [doc] = next.splice(from, 1);
      next.splice(to, 0, doc);
      return next;
    });
  }

  function announcePosition(id: string, list = docs) {
    const index = list.findIndex((doc) => doc.id === id);
    const doc = list[index];
    if (doc) setMessage(`${doc.title} moved to position ${index + 1} of ${list.length}.`);
  }

  function onHandleKeyDown(event: React.KeyboardEvent, id: string) {
    const index = docs.findIndex((doc) => doc.id === id);
    let to = index;
    if (event.key === "ArrowUp") to = index - 1;
    else if (event.key === "ArrowDown") to = index + 1;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = docs.length - 1;
    else return;
    event.preventDefault();
    if (to < 0 || to >= docs.length || to === index) return;
    const next = [...docs];
    const [doc] = next.splice(index, 1);
    next.splice(to, 0, doc);
    setDocs(next);
    announcePosition(id, next);
    /* The row re-renders in its new slot; keep the handle focused. */
    requestAnimationFrame(() => handles.current.get(id)?.focus());
  }

  function remove(id: string) {
    const index = docs.findIndex((doc) => doc.id === id);
    const doc = docs[index];
    if (!doc || leavingId) return;
    setLeavingId(id);
    window.setTimeout(() => {
      const next = docs.filter((item) => item.id !== id);
      setDocs(next);
      setLeavingId(null);
      setMessage(`${doc.title} deleted.`);
      /* Focus lands on the row that took its place, or the heading if none. */
      const neighbour = next[index] ?? next[index - 1];
      requestAnimationFrame(() => {
        if (neighbour) deletes.current.get(neighbour.id)?.focus();
        else headingRef.current?.focus();
      });
    }, EXIT_MS);
  }

  return (
    <section
      aria-labelledby="documents-title"
      className="rounded-2xl border border-card-border bg-white pb-[10px] shadow-card"
    >
      <div className="px-[19px] pt-[18px]">
        <h2
          id="documents-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-[16px] leading-[normal] font-semibold text-ink"
        >
          Document Stack
        </h2>
        <p id="documents-hint" className="mt-[10px] text-[13px] leading-none text-ink-secondary">
          You can drag &amp; drop these saved documents
        </p>
      </div>

      {docs.length === 0 ? (
        <p className="mx-[19px] mt-5 mb-[9px] rounded-xl bg-grey-50 px-4 py-5 text-[13px] leading-[18px] text-ink-tertiary">
          No saved documents. Documents you upload for an application are kept
          here to reuse.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-2 px-2">
          {docs.map((doc) => {
            const dragging = dragId === doc.id;
            const leaving = leavingId === doc.id;
            return (
              <li
                key={doc.id}
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
                    move(dragId, docs.findIndex((item) => item.id === doc.id));
                  }
                }}
                onDrop={(event) => event.preventDefault()}
                onDragEnd={() => {
                  if (dragId) announcePosition(dragId);
                  setDragId(null);
                }}
                className={`group relative h-[70px] cursor-grab rounded-xl border border-transparent transition-[opacity,transform,background-color,border-color,box-shadow] duration-150 ease-out select-none hover:border-grey-200 hover:bg-white hover:shadow-lifted focus-within:border-grey-200 focus-within:bg-white focus-within:shadow-lifted data-[dragging]:cursor-grabbing data-[dragging]:border-grey-200 data-[dragging]:bg-white data-[dragging]:opacity-60 ${
                  leaving ? "scale-[0.97] opacity-0" : ""
                }`}
              >
                <DocIcon multiPage={doc.multiPage} />

                <div className="absolute top-[14px] right-[44px] left-[73px] flex flex-col gap-1">
                  <h3 className="truncate text-[14px] leading-5 font-medium text-ink">
                    {doc.title}
                  </h3>
                  <p className="truncate text-[13px] leading-[normal] text-ink-tertiary">
                    {doc.owner}
                    <span aria-hidden className="mx-1">
                      ・
                    </span>
                    <span className="sr-only">, </span>
                    {doc.type}
                  </p>
                </div>

                <div className="absolute top-[5px] right-[6px] flex items-center gap-[2px] opacity-0 transition-opacity duration-150 ease-out group-focus-within:opacity-100 group-hover:opacity-100 group-data-[dragging]:opacity-100 [@media(hover:none)]:opacity-100">
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) deletes.current.set(doc.id, node);
                      else deletes.current.delete(doc.id);
                    }}
                    aria-label={`Delete ${doc.title}`}
                    onClick={() => remove(doc.id)}
                    className="grid size-6 place-items-center rounded-md transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-grey-100"
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
                    className="grid size-6 cursor-grab place-items-center rounded-md transition-colors duration-150 ease-out [@media(hover:hover)]:hover:bg-grey-100"
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

/**
 * A PDF page on a grey tile. Income Proof is drawn as two pages, offset
 * the way node 149:8960 stacks them.
 */
function DocIcon({ multiPage }: { multiPage?: boolean }) {
  const pages = multiPage
    ? [
        { page: [8.4, 7.4], mark: [13.7, 16.75] },
        { page: [14.4, 10.4], mark: [19.8, 19.75] },
      ]
    : [{ page: [12.4, 9.4], mark: [17.7, 18.75] }];

  return (
    <div
      aria-hidden
      className="absolute top-[7px] left-[7px] size-[54px] rounded-[9px] border-2 border-white bg-grey-100"
    >
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
  );
}
