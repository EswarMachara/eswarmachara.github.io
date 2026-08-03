export default function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-6 flex items-center gap-4 font-heading text-xl font-semibold text-slate ${className}`}>
      <span className="shrink-0">{children}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </h2>
  );
}
