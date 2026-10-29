"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AccountLink } from "./AccountLink";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { CloseIcon, MenuIcon, SearchIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { PRIMARY_NAV, SUPPORT_LINK, isActivePath } from "@/lib/navigation";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Fecha o menu ao navegar.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu mobile: trava a rolagem, foca o primeiro link e fecha com Esc.
  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 h-[var(--header-height)] transition-[background-color,border-color] duration-300 ${
        // Com o menu aberto o header fica sem backdrop-filter: ele criaria um containing
        // block e o menu `fixed` passaria a ser posicionado em relação ao header, sumindo.
        isMenuOpen
          ? "border-b border-line bg-bg"
          : isScrolled
            ? "border-b border-line bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70"
            : "border-b border-transparent bg-bg"
      }`}
    >
      <Container className="flex h-full items-center justify-between gap-3 sm:gap-6">
        <Logo />

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {PRIMARY_NAV.map((item) => {
              const isActive = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative py-2 text-[0.8125rem] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-fg after:transition-transform after:duration-300 ${
                      isActive
                        ? "text-fg after:scale-x-100"
                        : "text-muted after:scale-x-0 hover:text-fg"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/busca"
            aria-label="Buscar no site"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <SearchIcon />
          </Link>
          <AccountLink className="hidden px-2 sm:inline-flex" />
          <Link
            href={SUPPORT_LINK.href}
            className="group hidden min-h-[36px] items-center gap-2 rounded-full bg-fg px-4 text-[0.8125rem] font-medium text-bg transition-colors hover:bg-white sm:inline-flex"
          >
            {SUPPORT_LINK.label}
            <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="-mr-3 flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-fg/5 sm:mr-0 lg:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>

      <div
        ref={menuRef}
        id="mobile-menu"
        hidden={!isMenuOpen}
        className="fixed inset-x-0 bottom-0 top-[var(--header-height)] overflow-y-auto bg-bg lg:hidden"
      >
        <Container className="flex min-h-full flex-col pb-10 pt-6">
          <nav aria-label="Menu">
            <ul className="divide-y divide-line border-y border-line">
              {PRIMARY_NAV.map((item, index) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-[56px] items-center justify-between font-display text-2xl tracking-tight ${
                        isActive ? "text-fg" : "text-muted"
                      }`}
                    >
                      {item.label}
                      <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <AccountLink className="mt-6 self-start text-base" />
          <Link
            href={SUPPORT_LINK.href}
            className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-bg"
          >
            {SUPPORT_LINK.label}
            <ArrowRightIcon size={14} />
          </Link>
        </Container>
      </div>
    </header>
  );
}
