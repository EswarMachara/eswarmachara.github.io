"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared behaviour for the drawer and the two dialogs.
 *
 * All three declared `aria-modal="true"` while doing none of what that promises:
 * Tab walked straight out into the page behind, and closing dropped focus onto
 * `<body>`, so a keyboard user landed at the top of the document with no idea
 * where they were. This contains focus, restores it on close, and handles
 * Escape, in one place so the three cannot drift apart.
 */
export function useOverlay<T extends HTMLElement = HTMLDivElement>(onClose: () => void, lockScroll = true) {
  const containerRef = useRef<T>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  /**
   * The close callback is read through a ref so it can stay out of the effect's
   * dependencies.
   *
   * Consumers pass an inline arrow, which gets a new identity on every parent
   * render, and the parent re-renders on every store write. With `onClose` in
   * the dependency array the effect tore down and set up again per keystroke,
   * and its cleanup calls focus() on the element that opened the overlay. The
   * result was that every store-backed field in the drawer accepted exactly one
   * character before focus was yanked out from under the caret.
   */
  const onCloseRef = useRef(onClose);

  // Refs may not be written during render, so the sync happens here. Declared
  // before the main effect so it has already run when that one mounts.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const active = document.activeElement;
    // document.body means nothing was focused, which is what happens when one
    // overlay opens as another closes. Restoring to it would silently drop
    // focus to the top of the page, so treat it as "no anchor" and fall back.
    restoreRef.current = active instanceof HTMLElement && active !== document.body ? active : null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Wrap at both ends, and pull focus back in if it has escaped the panel.
      if (!container.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = lockScroll ? document.body.style.overflow : null;
    if (lockScroll) document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (previousOverflow !== null) document.body.style.overflow = previousOverflow;
      // The element that opened the overlay may itself be gone, e.g. the row
      // that was just deleted, or it may never have existed. Either way focus
      // has to land somewhere deliberate rather than on the document body.
      const restore = restoreRef.current;
      if (restore && document.contains(restore)) {
        restore.focus();
        return;
      }
      const fallback = document.querySelector<HTMLElement>("[data-overlay-return]");
      if (fallback) fallback.focus();
    };
    // Deliberately excludes onClose: see onCloseRef above. This effect must run
    // exactly once per overlay, not once per parent render.
  }, [lockScroll]);

  return containerRef;
}
