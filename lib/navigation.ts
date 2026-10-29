export interface NavItem {
  href: string;
  label: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/noticias", label: "Notícias" },
  { href: "/artigos", label: "Artigos" },
  { href: "/datasets", label: "Datasets" },
  { href: "/trilhas", label: "Trilhas" },
  { href: "/projetos", label: "Projetos" },
  { href: "/livros", label: "Livros" },
  { href: "/sobre", label: "Sobre" },
];

export const SUPPORT_LINK: NavItem = { href: "/doacoes", label: "Apoie o projeto" };

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
