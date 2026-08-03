"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FRAME_MS = 32;
const REVEAL_EVERY = 2;

export default function ScrambleText({
  text,
  as: Tag = "span",
  className,
  startDelay = 0,
}: {
  text: string;
  as?: "span" | "em";
  className?: string;
  startDelay?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;
    let revealed = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        frame++;
        if (frame % REVEAL_EVERY === 0 && revealed < text.length) revealed++;

        const next = text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < revealed) return text[index];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        setDisplay(next);

        if (revealed >= text.length) {
          setDisplay(text);
          if (intervalId) clearInterval(intervalId);
        }
      }, FRAME_MS);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, reducedMotion, startDelay]);

  return (
    <Tag className={className} aria-label={text}>
      {reducedMotion ? text : display}
    </Tag>
  );
}
