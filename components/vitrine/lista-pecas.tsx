import { PackageSearch, ServerCrash } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { PecaCard } from "@/components/vitrine/peca-card"
import { listarPecas } from "@/lib/api/pecas"

const gridClassName = "grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4"

export async function ListaPecas() {
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

  if (resultado.pecas.length === 0) {
    return (
      <Aviso
        icone={<PackageSearch className="size-8 text-muted-foreground" aria-hidden />}
        titulo="Nenhuma peça anunciada ainda."
        texto="Volte em breve ou anuncie a sua peça."
      />
    )
  }

  return (
    <ul className={gridClassName}>
      {resultado.pecas.map((peca) => (
        <li key={peca.id} className="flex">
          <PecaCard peca={peca} />
        </li>
      ))}
    </ul>
  )
}

export function ListaPecasSkeleton() {
  return (
    <ul className={gridClassName} aria-busy="true" aria-label="Carregando peças">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i}>
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
        </li>
      ))}
    </ul>
  )
}

function Aviso({
  icone,
  titulo,
  texto,
}: {
  icone: React.ReactNode
  titulo: string
  texto: string
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-10 text-center"
    >
      {icone}
      <p className="font-semibold">{titulo}</p>
      <p className="text-sm text-muted-foreground">{texto}</p>
    </div>
  )
}
