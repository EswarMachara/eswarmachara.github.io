"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { useHasFinePointer, usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const STRENGTH = 0.35;
const MAX_OFFSET = 14;

export default function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const hasFinePointer = useHasFinePointer();
  const enabled = hasFinePointer && !reducedMotion;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 14, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 14, mass: 0.4 });

  if (!enabled) return <span className={className}>{children}</span>;

  return (
    <motion.span
      className={`inline-block ${className ?? ""}`}
      style={{ x: springX, y: springY }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);
        x.set(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offsetX * STRENGTH)));
        y.set(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offsetY * STRENGTH)));
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
