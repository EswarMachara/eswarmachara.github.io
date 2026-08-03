"use client";

import { useRef, type ReactNode } from "react";
import { useHasFinePointer } from "@/lib/usePrefersReducedMotion";

/**
 * A mouse-following radial highlight for cards. Position is written straight to a CSS
 * custom property on the DOM node via a ref, not React state, so it can track every
 * mousemove at full frame rate without re-rendering.
 */
export default function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const hasFinePointer = useHasFinePointer();
  const ref = useRef<HTMLDivElement>(null);

  if (!hasFinePointer) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      className={`group/spotlight relative isolate overflow-hidden ${className ?? ""}`}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        ref.current?.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: "radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(171,125,47,0.14), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
