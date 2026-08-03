import type { BadgeVariant } from "@/data/research";

const variantClasses: Record<BadgeVariant, string> = {
  conf: "bg-badge-conf text-white",
  workshop: "bg-badge-workshop text-white",
  journal: "bg-badge-journal text-white",
  preprint: "bg-badge-preprint text-white",
  award: "bg-badge-award text-white",
  research: "bg-paper-raised text-ink border border-ink/15",
};

export default function Badge({ label, variant = "research" }: { label: string; variant?: BadgeVariant }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
