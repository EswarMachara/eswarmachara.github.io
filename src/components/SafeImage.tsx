"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { FaFileImage } from "react-icons/fa6";

/** Renders a Next.js image, falling back to a placeholder icon if the source 404s. */
export default function SafeImage({ className, alt, ...props }: ImageProps & { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-paper-raised text-ink/30 ${props.fill ? "absolute inset-0" : ""} ${className ?? ""}`}
      >
        <FaFileImage size={28} />
      </div>
    );
  }

  return <Image {...props} alt={alt} className={className} onError={() => setFailed(true)} />;
}
