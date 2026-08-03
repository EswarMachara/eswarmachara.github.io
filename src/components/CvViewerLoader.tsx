"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => <div className="flex h-[600px] items-center justify-center text-sm text-ink-soft">Loading CV…</div>,
});

export default function CvViewerLoader({ src }: { src: string }) {
  return <PdfViewer src={src} />;
}
