"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FaTriangleExclamation } from "react-icons/fa6";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(Math.min(entries[0].contentRect.width, 820));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-paper-raised px-6 py-16 text-center">
        <FaTriangleExclamation size={28} className="text-gold" />
        <p className="text-sm text-ink-soft">
          The preview couldn&apos;t load in this browser. You can still open the CV directly.
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/85"
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-lg bg-paper-raised p-3 sm:p-6">
      <Document
        file={src}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={() => setFailed(true)}
        loading={
          <div className="flex h-[600px] items-center justify-center text-sm text-ink-soft">Loading CV…</div>
        }
        className="flex flex-col items-center gap-6"
      >
        {width > 0 &&
          Array.from({ length: numPages ?? 0 }, (_, index) => (
            <Page
              key={index}
              pageNumber={index + 1}
              width={width}
              className="overflow-hidden border border-stone-200 shadow-md"
              renderAnnotationLayer={false}
            />
          ))}
      </Document>
    </div>
  );
}
