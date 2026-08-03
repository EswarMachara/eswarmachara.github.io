import SafeImage from "@/components/SafeImage";
import type { ExperienceEntry } from "@/data/experience";

export default function ExperienceCard({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="group flex h-full w-44 flex-col items-center border border-stone-200 bg-paper-raised/40 p-6 text-center transition-all hover:-translate-y-1 hover:border-gold/60 hover:bg-paper-raised sm:w-48">
      <div className={`relative h-24 w-full shrink-0 ${entry.logoClassName ?? ""}`}>
        <SafeImage
          src={entry.logo}
          alt={entry.institution}
          fill
          sizes="140px"
          className="object-contain grayscale-[35%] transition-all duration-300 group-hover:grayscale-0"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 py-4">
        <h3 className="font-heading text-base font-medium text-ink">{entry.institution}</h3>
        <p className="text-sm italic text-ink-soft">{entry.role}</p>
        {entry.person && (
          entry.person.href ? (
            <a
              href={entry.person.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-soft underline decoration-gold decoration-dashed underline-offset-2 hover:text-wine"
            >
              {entry.person.name}
            </a>
          ) : (
            <span className="text-sm text-ink-soft">{entry.person.name}</span>
          )
        )}
      </div>
      <p className="text-xs font-medium text-ink-soft">{entry.duration}</p>
    </div>
  );
}
