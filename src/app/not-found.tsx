import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-24 text-center">
      <p className="font-heading text-6xl font-bold text-navy/15">404</p>
      <h1 className="mt-4 font-heading text-2xl font-semibold text-navy">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue"
      >
        Back to Home
      </Link>
    </div>
  );
}
