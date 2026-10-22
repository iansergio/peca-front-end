"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { categoriasRapidas } from "@/components/vitrine/categorias"
import { cn } from "@/lib/utils"

/**
 * Sub-header com atalhos para as categorias mais procuradas. Cada atalho abre
 * /pecas já filtrado. No celular a barra rola na horizontal.
 */
export function CategoriasRapidas() {
  const pathname = usePathname()
  const categoria = useSearchParams().get("categoria")
  return <Barra ativa={pathname === "/pecas" ? categoria : null} />
}

/** Mesma barra sem destaque, para o shell estático (antes de ler a URL). */
export function CategoriasRapidasEstaticas() {
  return <Barra ativa={null} />
}

function Barra({ ativa }: { ativa: string | null }) {
  return (
    <nav aria-label="Categorias mais procuradas" className="border-b bg-card">
      <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] md:px-3">
        {categoriasRapidas.map(({ slug, nome }) => {
          const atual = ativa === slug
          return (
            <li key={slug} className="shrink-0">
              <Link
                href={`/pecas?categoria=${slug}`}
                aria-current={atual ? "page" : undefined}
                className={cn(
                  // Sublinhado que cresce do centro no hover: animação sutil e sem deslocar o layout.
                  "relative flex h-11 items-center rounded-md px-3 text-sm font-semibold text-tinta-suave outline-none transition-colors",
                  "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-marca after:transition-transform after:duration-200",
                  "hover:text-marca hover:after:scale-x-100 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]",
                  atual && "text-marca after:scale-x-100"
                )}
              >
                {nome}
              </Link>
            </li>
          )
        })}
        <li className="ml-auto shrink-0">
          <Link
            href="/pecas"
            className="flex h-11 items-center gap-0.5 rounded-md px-3 text-sm font-bold text-destaque outline-none transition-colors hover:text-marca focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Todas
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </li>
      </ul>
    </nav>
  )
}
