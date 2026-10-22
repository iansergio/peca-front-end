import Link from "next/link"

import { categorias } from "@/components/vitrine/categorias"

export function CategoryGrid() {
  return (
    <section aria-labelledby="categorias-titulo">
      <h2 id="categorias-titulo" className="mb-3 text-xl font-bold">
        Categorias
      </h2>
      {/*
       * Mobile: carrossel horizontal de 2 linhas com scroll-snap (o grid flui
       * por colunas e cada coluna tem largura fixa). A partir de `sm` vira uma
       * grade normal que cresce até 7 colunas, como no mockup.
       */}
      <ul className="-mx-4 grid snap-x snap-mandatory scroll-px-4 auto-cols-[7.5rem] grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid-flow-row sm:grid-cols-4 sm:grid-rows-none sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-5 lg:grid-cols-7">
        {categorias.map(({ slug, nome, icone: Icone }) => (
          <li key={slug} className="snap-start">
            <Link
              href={`/pecas?categoria=${slug}`}
              className="flex h-full min-h-24 flex-col items-center justify-center gap-2 rounded-xl border bg-card p-3 text-center text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Icone className="size-6 text-primary" aria-hidden />
              <span className="leading-tight">{nome}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
