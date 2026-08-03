"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function HeroIntro({ children }: { children: ReactNode }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.aside>
  );
}
