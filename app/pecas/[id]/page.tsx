import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ServerCrash } from "lucide-react";

import { DetalhePeca, PaginaDetalhe } from "@/components/peca/detalhe-peca";
import { DetalhePecaCarregando } from "@/components/peca/detalhe-peca-carregando";
import { buscarPeca } from "@/lib/api/pecas";
import { formatarPreco } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/pecas/[id]">): Promise<Metadata> {
  const { id } = await params;
  // Mesma chamada da página: `buscarPeca` usa React.cache e só vai uma vez ao backend.
  const resultado = await buscarPeca(id);
  if (!resultado.ok) return { title: "Peça - PEÇA" };

  const { peca } = resultado;
  const description = [formatarPreco(peca.preco), peca.modeloCelular && `compatível com ${peca.modeloCelular}`]
    .filter(Boolean)
    .join(" · ");

  return {
    title: `${peca.titulo} - PEÇA`,
    description,
    openGraph: {
      title: peca.titulo,
      description,
      type: "website",
      images: peca.imagemUrl ? [{ url: peca.imagemUrl, alt: peca.titulo }] : undefined,
    },
  };
}

export default function PecaPage({ params }: PageProps<"/pecas/[id]">) {
  return (
    <PaginaDetalhe>
      {/* `params` e a peça são dados de requisição: só o conteúdo espera por eles. */}
      <Suspense fallback={<DetalhePecaCarregando />}>
        <Conteudo params={params} />
      </Suspense>
    </PaginaDetalhe>
  );
}

async function Conteudo({ params }: Pick<PageProps<"/pecas/[id]">, "params">) {
  const { id } = await params;
  const resultado = await buscarPeca(id);

  if (resultado.ok) return <DetalhePeca peca={resultado.peca} />;
  if (resultado.erro === "nao-encontrada") notFound();

  // Falha do backend não é 404: a peça pode existir, então oferecemos tentar de novo.
  return (
    <div className="px-4 pt-4 lg:px-0 lg:pt-0">
      <div
        role="status"
        className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-10 text-center"
      >
        <ServerCrash className="size-8 text-muted-foreground" aria-hidden />
        <p className="font-semibold">Não foi possível carregar esta peça agora.</p>
        <p className="text-sm text-muted-foreground">
          Nossa vitrine está fora do ar por um instante. Tente novamente em alguns minutos.
        </p>
        {/* <a> e não <Link>: recarrega a página inteira e refaz a busca. */}
        <a
          href={`/pecas/${encodeURIComponent(id)}`}
          className="mt-1 inline-flex h-11 items-center rounded-sm font-bold text-destaque underline underline-offset-4 outline-none hover:text-marca focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Tentar de novo
        </a>
      </div>
    </div>
  );
}
