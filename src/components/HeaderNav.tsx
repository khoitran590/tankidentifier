"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isNavActive, MAIN_NAV } from "@/lib/navigation";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent-muted font-semibold text-accent shadow-sm ring-1 ring-inset ring-accent/40 dark:shadow-[0_0_14px_rgba(251,191,36,0.12)]"
          : "text-muted hover:bg-card-muted hover:text-foreground dark:hover:text-heading"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 translate-y-2 rounded-full bg-accent" />
      )}
    </Link>
  );
}

export function HeaderNav() {
  const pathname = usePathname();
  const { user, loading, configured } = useAuth();

  const items = [...MAIN_NAV];
  const showMyTanks = configured && !loading && user;

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          active={isNavActive(pathname, item.href)}
        />
      ))}
      {showMyTanks && (
        <NavLink
          href="/my-tanks"
          label="My tanks"
          active={isNavActive(pathname, "/my-tanks")}
        />
      )}
    </nav>
  );
}
