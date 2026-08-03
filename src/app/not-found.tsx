import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-heading text-7xl italic text-ink/10">404</p>
      <h1 className="mt-4 font-heading text-3xl font-medium text-ink">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/85"
      >
        Back to Home
      </Link>
    </div>
  );
}
