import Link from "next/link"
import { PackageSearch, ServerCrash } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { PecaCard } from "@/components/vitrine/peca-card"
import { listarPecas } from "@/lib/api/pecas"
import { filtrarPecas } from "@/lib/filtro-pecas"

type Layout = "carrossel" | "grade"

const classesLista: Record<Layout, string> = {
  // Mobile: carrossel horizontal com scroll-snap e o próximo cartão aparecendo
  // na borda (convida a rolar). A partir de `sm` vira grade de 3/4 colunas.
  carrossel:
    "-mx-4 grid snap-x snap-mandatory scroll-px-4 auto-cols-[72%] grid-flow-col gap-3 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] sm:mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 md:gap-4 lg:grid-cols-4",
  grade: "grid grid-cols-1 gap-3 pt-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:gap-4 lg:grid-cols-4",
}

export async function ListaPecas({
  layout = "grade",
  limite,
  valoresApi,
  termo,
}: {
  layout?: Layout
  limite?: number
  /** Categorias da API a mostrar (ver `resolverCategoria`). */
  valoresApi?: string[]
  termo?: string
}) {
  const resultado = await listarPecas()

  if (!resultado.ok) {
    return (
      <Aviso
        icone={<ServerCrash className="size-8 text-muted-foreground" aria-hidden />}
        titulo="Não foi possível carregar as peças agora."
        texto="Nossa vitrine está fora do ar por um instante. Tente novamente em alguns minutos."
      />
    )
  }

  const filtrando = Boolean(valoresApi || termo)
  const pecas = filtrarPecas(resultado.pecas, { valoresApi, termo }).slice(0, limite)

  if (pecas.length === 0) {
    return filtrando ? (
      <Aviso
        icone={<PackageSearch className="size-8 text-muted-foreground" aria-hidden />}
        titulo="Nenhuma peça encontrada."
        texto="Tente outro termo ou veja todas as peças anunciadas."
        link={{ href: "/pecas", rotulo: "Ver todas as peças" }}
      />
    ) : (
      <Aviso
        icone={<PackageSearch className="size-8 text-muted-foreground" aria-hidden />}
        titulo="Nenhuma peça anunciada ainda."
        texto="Volte em breve ou anuncie a sua peça."
      />
    )
  }

  return (
    <ul className={classesLista[layout]}>
      {pecas.map((peca, i) => (
        <li key={peca.id} className="flex snap-start">
          {/* As primeiras fotos costumam estar na primeira dobra (LCP). */}
          <PecaCard peca={peca} prioridade={i < 2} />
        </li>
      ))}
    </ul>
  )
}

export function ListaPecasSkeleton({ layout = "grade" }: { layout?: Layout }) {
  return (
    <ul className={classesLista[layout]} aria-busy="true" aria-label="Carregando peças">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i}>
          {/* `bg-borda`: o `bg-muted` padrão some no fundo da página. */}
          <Skeleton className="aspect-[3/4] w-full rounded-xl bg-borda" />
        </li>
      ))}
    </ul>
  )
}

function Aviso({
  icone,
  titulo,
  texto,
  link,
}: {
  icone: React.ReactNode
  titulo: string
  texto: string
  link?: { href: string; rotulo: string }
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-10 text-center"
    >
      {icone}
      <p className="font-semibold">{titulo}</p>
      <p className="text-sm text-muted-foreground">{texto}</p>
      {link && (
        <Link
          href={link.href}
          className="mt-1 inline-flex h-11 items-center font-bold text-destaque underline underline-offset-4 hover:text-marca"
        >
          {link.rotulo}
        </Link>
      )}
    </div>
  )
}
