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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/95 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-white transition-colors hover:text-white/80 sm:text-xl"
          onClick={() => setOpen(false)}
        >
          {site.name}
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`relative block rounded px-3 py-2 font-heading text-sm font-medium transition-colors ${
                    isActive ? "text-navy" : "text-white/85 hover:text-navy"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded bg-white"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <a
              href={site.cv}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 block rounded px-3 py-2 font-heading text-sm font-medium text-white/85 transition-colors hover:text-navy hover:bg-white"
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
          className="flex h-9 w-9 items-center justify-center rounded text-white sm:hidden"
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
            className="overflow-hidden border-t border-white/10 sm:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-5 py-3 font-heading text-sm font-medium ${
                    pathname === item.href ? "bg-white text-navy" : "text-white/85"
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
                className="block px-5 py-3 font-heading text-sm font-medium text-white/85"
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
