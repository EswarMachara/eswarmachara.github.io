"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, type ReactNode } from "react";
import { useHasFinePointer, usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export default function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const hasFinePointer = useHasFinePointer();
  const enabled = hasFinePointer && !reducedMotion;
  const [hovering, setHovering] = useState(false);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springX = useSpring(px, { stiffness: 220, damping: 22 });
  const springY = useSpring(py, { stiffness: 220, damping: 22 });

  const rotateX = useTransform(springY, [0, 1], [10, -10]);
  const rotateY = useTransform(springX, [0, 1], [-10, 10]);
  const glowX = useTransform(springX, [0, 1], ["10%", "90%"]);
  const glowY = useTransform(springY, [0, 1], ["10%", "90%"]);

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={{ perspective: 900 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        px.set((event.clientX - rect.left) / rect.width);
        py.set((event.clientY - rect.top) / rect.height);
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        px.set(0.5);
        py.set(0.5);
      }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          animate={{ opacity: hovering ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(171,125,47,0.35), transparent 60%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
