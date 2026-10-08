"use client";

import { useEffect } from "react";

/**
 * Counts this browser's visit once per session (a new tab or a return
 * later is a new visit): a random id kept in this browser, the kind of
 * device and the first page, sent to /api/visits. Automated browsers (the
 * flow checks, the weekly audit) aren't counted unless a check asks to be.
 */
export function VisitBeacon() {
  useEffect(() => {
    try {
      if (navigator.webdriver && localStorage.getItem("ditto.visits.test") !== "1") return;
      if (sessionStorage.getItem("ditto.visit")) return;
      sessionStorage.setItem("ditto.visit", "1");
      let visitor = localStorage.getItem("ditto.visitor");
      if (!visitor) {
        visitor = crypto.randomUUID();
        localStorage.setItem("ditto.visitor", visitor);
      }
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const device = !touch ? "desktop" : window.innerWidth < 640 ? "phone" : "tablet";
      fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor, device, page: window.location.pathname.slice(0, 120) }),
        keepalive: true,
      }).catch(() => {
        /* A visit that can't be counted isn't the visitor's problem. */
      });
    } catch {
      /* Storage blocked: don't count. */
    }
  }, []);
  return null;
}
