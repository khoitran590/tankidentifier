"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isNavActive, MAIN_NAV } from "@/lib/navigation";

export function HeaderNavMobile() {
  const pathname = usePathname();
  const { user, loading, configured } = useAuth();

  const links = [...MAIN_NAV];
  if (configured && !loading && user) {
    links.push({
      href: "/my-tanks",
      label: "My tanks",
      description: "Your custom tanks",
    });
  }

  return (
    <ul className="space-y-1">
      {links.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`flex flex-col rounded-lg px-4 py-3 transition ${
              isNavActive(pathname, item.href)
                ? "bg-accent-muted text-accent"
                : "text-foreground hover:bg-card-muted"
            }`}
          >
            <span className="font-medium">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted">{item.description}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
