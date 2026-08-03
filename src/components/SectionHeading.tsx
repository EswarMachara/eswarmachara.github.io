export default function SectionHeading({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
}) {
  return (
    <h2 className={`mb-7 flex items-baseline gap-4 ${className}`}>
      {index && (
        <span className="font-heading text-base italic text-gold" aria-hidden="true">
          {index}
        </span>
      )}
      <span className="shrink-0 font-heading text-2xl font-medium text-ink">{children}</span>
      <span className="h-px flex-1 self-center bg-stone-200" />
    </h2>
  );
}
