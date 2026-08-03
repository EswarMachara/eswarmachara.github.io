import type { BadgeVariant } from "@/data/research";

const variantClasses: Record<BadgeVariant, string> = {
  conf: "bg-badge-conf text-white",
  workshop: "bg-badge-workshop text-white",
  journal: "bg-badge-journal text-white",
  preprint: "bg-badge-preprint text-white",
  award: "bg-badge-award text-white",
  research: "bg-navy-50 text-navy border border-navy/15",
};

export default function Badge({ label, variant = "research" }: { label: string; variant?: BadgeVariant }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-[0.72rem] font-semibold tracking-wide font-heading ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
