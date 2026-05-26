export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

export const MAIN_NAV: NavItem[] = [
  {
    href: "/",
    label: "Catalog",
    description: "Browse all tanks",
  },
  {
    href: "/compare",
    label: "Compare",
    description: "Side-by-side specs",
  },
  {
    href: "/patch-notes",
    label: "Patch notes",
    description: "Catalog updates",
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/tanks/");
  }
  if (href === "/my-tanks") {
    return pathname === "/my-tanks" || pathname.startsWith("/my-tanks/");
  }
  if (href === "/patch-notes") {
    return pathname === "/patch-notes" || pathname.startsWith("/patch-notes/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
