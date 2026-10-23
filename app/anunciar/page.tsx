import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { FormularioAnuncio } from "@/components/anuncio/formulario-anuncio";
import { Skeleton } from "@/components/ui/skeleton";
import { buscarMeuPerfil } from "@/lib/api/perfil";
import { lerSessao } from "@/lib/sessao";

export const metadata: Metadata = {
  title: "Anunciar peça - PEÇA",
};

export default function AnunciarPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Anunciar peça</h1>
      <p className="mt-1 mb-6 text-muted-foreground">
        Preencha os dados e publique sua peça na vitrine.
      </p>
      <div className="rounded-2xl border bg-card p-4 md:p-6">
        {/* Lê o cookie e o perfil no backend: com Cache Components, fica atrás do Suspense. */}
        <Suspense fallback={<FormularioCarregando />}>
          <FormularioComPerfil />
        </Suspense>
      </div>
    </div>
  );
}

/** Preenche o WhatsApp com o do perfil. Se a busca falhar, o campo começa vazio. */
async function FormularioComPerfil() {
  let whatsapp = "";
  const sessao = await lerSessao();
  if (sessao) {
    try {
      whatsapp = (await buscarMeuPerfil(sessao.token)).whatsapp ?? "";
    } catch (erro) {
      unstable_rethrow(erro);
      console.warn("[anunciar] perfil indisponível; WhatsApp começa vazio", erro);
    }
  }
  return <FormularioAnuncio whatsappInicial={whatsapp} />;
}

function FormularioCarregando() {
  return (
    <div className="flex flex-col gap-5" aria-hidden>
      <Skeleton className="h-6 w-32" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
