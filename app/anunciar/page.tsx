import type { Metadata } from "next";

import { FormularioAnuncio } from "@/components/anuncio/formulario-anuncio";

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
        <FormularioAnuncio />
      </div>
    </div>
  );
}
