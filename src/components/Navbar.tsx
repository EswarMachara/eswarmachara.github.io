"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBars, FaXmark } from "react-icons/fa6";
import { site } from "@/data/profile";

const NAV_ITEMS = [
  { href: "/", label: "About" },
  { href: "/research", label: "Research" },
  { href: "/experience", label: "Experience" },
  // Projects section is intentionally left out of the primary nav for now while
  // detail pages are still being written up — the route itself stays live at /projects.
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 font-heading text-xl italic text-ink transition-opacity hover:opacity-70"
          onClick={() => setOpen(false)}
        >
          {site.shortName}
          <span aria-hidden="true" className="text-sm text-gold">·</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`relative block px-3 py-2 text-[0.95rem] font-medium tracking-wide transition-colors ${
                    isActive ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <span className="relative">{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-[2px] bg-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <a
              href={site.cv}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 block rounded-full border border-ink/70 px-4 py-1.5 text-[0.85rem] font-medium tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              CV
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded text-ink sm:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FaXmark size={20} /> : <FaBars size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-stone-200 sm:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-5 py-3 text-sm font-medium ${
                    pathname === item.href ? "bg-paper-raised text-ink" : "text-ink-soft"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={site.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-3 text-sm font-medium text-ink-soft"
              >
                CV
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
