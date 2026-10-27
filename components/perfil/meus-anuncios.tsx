import Image from "next/image"
import Link from "next/link"
import { PackageOpen, Pencil, ServerCrash, Smartphone } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { iconePorCategoria } from "@/components/vitrine/categorias"
import { listarPecas } from "@/lib/api/pecas"
import { formatarPreco } from "@/lib/format"
import { lerSessao } from "@/lib/sessao"
import type { Peca } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Anúncios da pessoa logada.
 *
 * O backend ainda não tem um endpoint "meus anúncios" (nem filtro por
 * vendedor em `GET /pecas`), então buscamos a listagem pública e filtramos
 * pelo `vendedor.id` igual ao `sub` do token. Funciona enquanto a vitrine é
 * pequena; com paginação no backend, isso precisa virar uma rota própria.
 */
export async function MeusAnuncios() {
  const sessao = await lerSessao()
  if (!sessao) return null

  const resultado = await listarPecas()
  if (!resultado.ok) {
    return (
      <Vazio icone={<ServerCrash className="size-8 text-muted-foreground" aria-hidden />} titulo="Não foi possível carregar os seus anúncios agora.">
        Tente novamente em alguns minutos.
      </Vazio>
    )
  }

  const meus = resultado.pecas.filter((p) => p.vendedor?.id === sessao.usuarioId)
  if (meus.length === 0) {
    return (
      <Vazio icone={<PackageOpen className="size-8 text-muted-foreground" aria-hidden />} titulo="Você ainda não anunciou nenhuma peça.">
        <Link href="/anunciar" className={cn(buttonVariants(), "mt-3 px-6")}>
          Anunciar peça
        </Link>
      </Vazio>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {meus.length === 1 ? "1 anúncio na vitrine" : `${meus.length} anúncios na vitrine`}
      </p>
      <ul className="flex flex-col gap-3">
        {meus.map((peca) => (
          <li key={peca.id}>
            <ItemAnuncio peca={peca} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ItemAnuncio({ peca }: { peca: Peca }) {
  const Icone = iconePorCategoria[peca.categoria] ?? Smartphone

  return (
    <article className="flex gap-3 rounded-xl bg-card p-3 shadow-cartao transition-shadow hover:shadow-md">
      <Link
        href={`/pecas/${peca.id}`}
        aria-label={`Ver anúncio de ${peca.titulo}`}
        className="relative flex aspect-[4/3] w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-32"
      >
        {peca.imagemUrl ? (
          <Image src={peca.imagemUrl} alt="" fill sizes="128px" className="object-cover" />
        ) : (
          <Icone className="size-7 text-primary/70" aria-hidden />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-xs font-semibold text-destaque">{peca.categoria}</p>
        <h3 className="line-clamp-2 font-bold leading-snug">{peca.titulo}</h3>
        <p className="truncate text-xs text-muted-foreground">Compatível: {peca.modeloCelular}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-lg font-extrabold">{formatarPreco(peca.preco)}</p>
          <Link
            href={`/pecas/${peca.id}/editar`}
            aria-label={`Editar ${peca.titulo}`}
            className={cn(buttonVariants({ variant: "outline" }), "px-4")}
          >
            <Pencil aria-hidden />
            Editar
          </Link>
        </div>
      </div>
    </article>
  )
}

function Vazio({ icone, titulo, children }: { icone: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-10 text-center">
      {icone}
      <p className="font-semibold">{titulo}</p>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

export function MeusAnunciosCarregando() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-4 w-32" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3 rounded-xl bg-card p-3 shadow-cartao">
          <Skeleton className="aspect-[4/3] w-24 sm:w-32" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-auto h-11 w-24 self-end" />
          </div>
        </div>
      ))}
    </div>
  )
}
