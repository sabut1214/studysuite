"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/gpa", label: "GPA <-> %" },
  { href: "/routine", label: "Routine" },
  { href: "/split", label: "Split" },
  { href: "/notes", label: "Notes to PDF" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/60 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <div className="text-sm uppercase tracking-[0.3em] text-amber-700">
            Nepali
          </div>
          <div className="text-xl font-semibold text-slate-900 group-hover:text-slate-700">
            Student Toolkit
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-white/70 text-slate-700 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
