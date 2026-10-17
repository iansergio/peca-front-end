import { Suspense } from "react";

import { CategoryGrid } from "@/components/vitrine/category-grid";
import { CtaProcurando } from "@/components/vitrine/cta-procurando";
import { HeroSection } from "@/components/vitrine/hero-section";
import { ListaPecas, ListaPecasSkeleton } from "@/components/vitrine/lista-pecas";

export default async function Home() {
  return (
    <div className="flex flex-col gap-10">
      <HeroSection />
      <CategoryGrid />

      <section id="destaques" aria-labelledby="destaques-titulo" className="scroll-mt-28">
        <h2 id="destaques-titulo" className="mb-3 text-xl font-bold">
          Destaques
        </h2>
        {/*
         * A listagem usa fetch com `no-store`. Com Cache Components, dados não
         * cacheados precisam ficar dentro de <Suspense>: o resto da página é
         * prerenderizado e as peças são transmitidas a cada requisição.
         */}
        <Suspense fallback={<ListaPecasSkeleton />}>
          <ListaPecas />
        </Suspense>
      </section>

      <CtaProcurando />
    </div>
  );
}
