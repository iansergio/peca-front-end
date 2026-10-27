import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, LockKeyhole, ServerCrash } from "lucide-react";

import { FormularioEditarAnuncio } from "@/components/anuncio/formulario-editar-anuncio";
import { Skeleton } from "@/components/ui/skeleton";
import { buscarMeuPerfil } from "@/lib/api/perfil";
import { buscarPeca } from "@/lib/api/pecas";
import { lerSessao } from "@/lib/sessao";

export const metadata: Metadata = {
  title: "Editar anúncio - PEÇA",
  robots: { index: false },
};

export default function EditarAnuncioPage({ params }: PageProps<"/pecas/[id]/editar">) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/perfil?aba=anuncios"
        className="-ml-2 mb-2 inline-flex h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-destaque outline-none hover:text-marca focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Meus anúncios
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Editar anúncio</h1>
      <p className="mt-1 mb-6 text-muted-foreground">
        Ajuste os dados da peça. As mudanças aparecem na vitrine assim que você salvar.
      </p>
      {/* Lê o cookie, a peça e o perfil no backend: com Cache Components, fica atrás do Suspense. */}
      <Suspense fallback={<EdicaoCarregando />}>
        <Edicao params={params} />
      </Suspense>
    </div>
  );
}

async function Edicao({ params }: Pick<PageProps<"/pecas/[id]/editar">, "params">) {
  const { id } = await params;
  const sessao = await lerSessao();
  // O Proxy já redireciona quem não tem cookie; aqui cobre o token expirado.
  if (!sessao) redirect(`/login?destino=${encodeURIComponent(`/pecas/${id}/editar`)}`);

  const resultado = await buscarPeca(id);
  if (!resultado.ok) {
    if (resultado.erro === "nao-encontrada") notFound();
    return (
      <Aviso icone={<ServerCrash className="size-8 text-muted-foreground" aria-hidden />} titulo="Não foi possível carregar o anúncio agora.">
        Tente novamente em alguns minutos.
      </Aviso>
    );
  }

  const { peca } = resultado;
  // O backend também recusa (403) a edição de quem não é o vendedor; checar
  // aqui só evita mostrar um formulário que não poderia ser salvo.
  if (peca.vendedor?.id !== sessao.usuarioId) {
    return (
      <Aviso icone={<LockKeyhole className="size-8 text-muted-foreground" aria-hidden />} titulo="Este anúncio não é seu.">
        Só quem publicou a peça pode editá-la.{" "}
        <Link href={`/pecas/${peca.id}`} className="font-bold text-destaque underline underline-offset-4 hover:text-marca">
          Ver anúncio
        </Link>
      </Aviso>
    );
  }

  // O contato do anúncio é o WhatsApp do perfil; o da peça é o fallback se o perfil falhar.
  let whatsapp = peca.vendedor.whatsapp ?? "";
  try {
    whatsapp = (await buscarMeuPerfil(sessao.token)).whatsapp ?? whatsapp;
  } catch (erro) {
    unstable_rethrow(erro);
    console.warn("[editar] perfil indisponível; usa o WhatsApp do anúncio", erro);
  }

  return <FormularioEditarAnuncio peca={peca} whatsappInicial={whatsapp} />;
}

function Aviso({ icone, titulo, children }: { icone: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-10 text-center">
      {icone}
      <p className="font-semibold">{titulo}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function EdicaoCarregando() {
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-card p-4 shadow-cartao md:p-6" aria-hidden>
      <Skeleton className="h-6 w-32" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton className="aspect-[4/3] w-full sm:w-40" />
    </div>
  );
}
