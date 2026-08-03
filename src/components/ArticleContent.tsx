import Image from "next/image";
import type { ArticleSection, ContentBlock } from "@/data/content";

function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="text-[1.05rem] leading-[1.85] text-ink-soft">{block.text}</p>;
    case "subheading":
      return <h4 className="mt-2 font-heading text-lg font-medium text-ink">{block.text}</h4>;
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-[1.05rem] leading-[1.85] text-ink-soft marker:text-gold">
          {block.items.map((item, index) => (
            <li key={index}>
              {item.label && <strong className="font-semibold text-ink">{item.label} </strong>}
              {item.text}
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure>
          <div className="relative w-full overflow-hidden rounded-lg border border-stone-200 bg-paper-raised">
            <Image src={block.src} alt={block.alt} width={1400} height={700} className="h-auto w-full object-contain" />
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm italic text-ink-soft">{block.caption}</figcaption>
          )}
        </figure>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-paper-raised">
              <tr>
                {block.headers.map((header) => (
                  <th key={header} className="border-b border-stone-200 px-4 py-2.5 font-semibold text-ink">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-paper even:bg-paper-raised/60">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-b border-stone-100 px-4 py-2.5 text-ink-soft">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default function ArticleContent({ section }: { section: ArticleSection }) {
  return (
    <section className="space-y-4">
      <h3 className="font-heading text-xl font-medium text-ink">{section.heading}</h3>
      {section.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </section>
  );
}
