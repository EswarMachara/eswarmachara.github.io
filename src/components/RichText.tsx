import type { RichText as RichTextType } from "@/data/types";

export default function RichText({ segments }: { segments: RichTextType }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.href) {
          return (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-hover"
            >
              {segment.text}
            </a>
          );
        }
        if (segment.bold) {
          return (
            <strong key={index} className="font-semibold text-navy">
              {segment.text}
            </strong>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </>
  );
}
