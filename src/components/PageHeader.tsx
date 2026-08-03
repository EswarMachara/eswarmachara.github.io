import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

export default function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Reveal>
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
        <span className="h-px w-9 bg-gold" />
        {kicker}
      </p>
      <h1 className="mt-5 font-heading text-4xl font-medium text-ink sm:text-5xl">{title}</h1>
      {children && <div className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft">{children}</div>}
    </Reveal>
  );
}
