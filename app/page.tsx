import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";

import { CategoryGrid } from "@/components/vitrine/category-grid";
import { CtaProcurando } from "@/components/vitrine/cta-procurando";
import { HeroSection } from "@/components/vitrine/hero-section";
import { ListaPecas, ListaPecasSkeleton } from "@/components/vitrine/lista-pecas";

/** Quantos anúncios a vitrine da home mostra antes do "Ver todos". */
const LIMITE_DESTAQUES = 8;

export default async function Home() {
  return (
    <div className="flex flex-col gap-10">
      <HeroSection />

      <section id="destaques" aria-labelledby="destaques-titulo" className="scroll-mt-32">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 id="destaques-titulo" className="text-xl font-bold md:text-2xl">
            Destaques
          </h2>
          <Link
            href="/pecas"
            className="-mr-2 inline-flex h-11 items-center gap-0.5 rounded-md px-2 text-sm font-bold text-destaque underline-offset-4 outline-none transition-colors hover:text-marca hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ver todos
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        {/*
         * A listagem usa fetch com `no-store`. Com Cache Components, dados não
         * cacheados precisam ficar dentro de <Suspense>: o resto da página é
         * prerenderizado e as peças são transmitidas a cada requisição.
         */}
        <Suspense fallback={<ListaPecasSkeleton layout="carrossel" />}>
          <ListaPecas layout="carrossel" limite={LIMITE_DESTAQUES} />
        </Suspense>
      </section>

      <CategoryGrid />
      <CtaProcurando />
    </div>
  );
}
