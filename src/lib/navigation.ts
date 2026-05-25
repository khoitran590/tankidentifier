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
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/tanks/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
