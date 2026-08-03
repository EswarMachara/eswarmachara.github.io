import Image from "next/image";
import type { ContentBlock, ProjectSection } from "@/data/projects";

function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="text-[0.98rem] leading-relaxed text-slate-700">{block.text}</p>;
    case "subheading":
      return <h4 className="mt-2 font-heading text-base font-semibold text-navy-light">{block.text}</h4>;
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-[0.98rem] leading-relaxed text-slate-700 marker:text-blue">
          {block.items.map((item, index) => (
            <li key={index}>
              {item.label && <strong className="font-semibold text-navy">{item.label} </strong>}
              {item.text}
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure>
          <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Image src={block.src} alt={block.alt} width={1000} height={560} className="h-auto w-full object-contain" />
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm italic text-slate-500">{block.caption}</figcaption>
          )}
        </figure>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-navy-50">
              <tr>
                {block.headers.map((header) => (
                  <th key={header} className="border-b border-slate-200 px-4 py-2.5 font-heading font-semibold text-navy">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white even:bg-slate-50/60">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-b border-slate-100 px-4 py-2.5 text-slate-700">
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

export default function ProjectContent({ section }: { section: ProjectSection }) {
  return (
    <section className="space-y-4">
      <h3 className="font-heading text-lg font-semibold text-navy">{section.heading}</h3>
      {section.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </section>
  );
}
