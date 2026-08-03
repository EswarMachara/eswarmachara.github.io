import SafeImage from "@/components/SafeImage";
import type { ExperienceEntry } from "@/data/experience";

export default function ExperienceCard({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-24 w-full items-center justify-center">
        <SafeImage
          src={entry.logo}
          alt={entry.institution}
          width={110}
          height={110}
          className={`h-auto max-h-24 w-auto max-w-[110px] object-contain ${entry.logoClassName ?? ""}`}
        />
      </div>
      <h3 className="mt-5 font-heading text-base font-semibold text-navy">{entry.institution}</h3>
      <p className="mt-1 text-sm font-medium text-blue">{entry.role}</p>
      {entry.person && (
        <a
          href={entry.person.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 text-sm text-blue underline decoration-blue/40 decoration-dashed underline-offset-2 hover:text-blue-dark"
        >
          {entry.person.name}
        </a>
      )}
      <p className="mt-1.5 text-xs font-medium text-slate-500">{entry.duration}</p>
    </div>
  );
}
