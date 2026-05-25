export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

export const MAIN_NAV: NavItem[] = [
  {
    href: "/",
    label: "Catalog",
    description: "Tanks and military aircraft",
  },
  {
    href: "/compare",
    label: "Compare",
    description: "Side-by-side specs",
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return (
      pathname === "/" ||
      pathname.startsWith("/tanks/") ||
      pathname.startsWith("/aircraft/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
