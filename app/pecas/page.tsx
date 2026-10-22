import type { Metadata } from "next";
import { Suspense } from "react";

import { resolverCategoria } from "@/components/vitrine/categorias";
import { ListaPecas, ListaPecasSkeleton } from "@/components/vitrine/lista-pecas";

export const metadata: Metadata = {
  title: "Peças - PEÇA",
};

export default function PecasPage({ searchParams }: PageProps<"/pecas">) {
  return (
    // `searchParams` é dado de requisição: só o conteúdo filtrado espera por ele.
    <Suspense fallback={<Carregando />}>
      <Resultados searchParams={searchParams} />
    </Suspense>
  );
}

function primeiro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

async function Resultados({ searchParams }: Pick<PageProps<"/pecas">, "searchParams">) {
  const params = await searchParams;
  const termo = primeiro(params.q)?.trim() || undefined;
  // Slug desconhecido é ignorado (mostra tudo) em vez de dar lista vazia.
  const categoria = resolverCategoria(primeiro(params.categoria));

  const titulo = categoria?.nome ?? (termo ? "Resultados da busca" : "Todas as peças");

  return (
    <section aria-labelledby="pecas-titulo">
      <h1 id="pecas-titulo" className="text-2xl font-extrabold tracking-tight md:text-3xl">
        {titulo}
      </h1>
      {termo && (
        <p className="mt-1 text-muted-foreground">
          Buscando por <strong className="text-foreground">“{termo}”</strong>
        </p>
      )}
      <div className="mt-5">
        <ListaPecas valoresApi={categoria?.valoresApi} termo={termo} />
      </div>
    </section>
  );
}

function Carregando() {
  return (
    <section>
      <div className="h-9 w-48 animate-pulse rounded-lg bg-borda" aria-hidden />
      <div className="mt-5">
        <ListaPecasSkeleton />
      </div>
    </section>
  );
}
