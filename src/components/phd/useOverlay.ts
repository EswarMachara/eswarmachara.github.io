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

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
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
      // that was just deleted. Falling back to the body keeps this a no-op
      // rather than a crash.
      const restore = restoreRef.current;
      if (restore && document.contains(restore)) restore.focus();
    };
  }, [onClose, lockScroll]);

  return containerRef;
}
