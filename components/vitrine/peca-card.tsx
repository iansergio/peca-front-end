import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Smartphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { iconePorCategoria } from "@/components/vitrine/categorias"
import { formatarPreco } from "@/lib/format"
import type { Condicao, Peca } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Cores dos selos de condição (prancha "Botões, campos e selos"). */
const varianteCondicao = {
  Nova: "default",
  Original: "acento",
  Retirada: "destaque",
  Usada: "outline",
} as const satisfies Record<Condicao, string>

/**
 * Cartão da listagem (docs/Cartão de produto.png): foto 4:3 com o selo de
 * condição no canto, peça, modelo compatível, preço e a ação. Em listagens a
 * ação é o botão contornado: ele abre a página de detalhes (/pecas/[id]) em
 * nova aba, e é lá que fica o contato pelo WhatsApp, no botão laranja.
 */
export function PecaCard({ peca, prioridade = false }: { peca: Peca; prioridade?: boolean }) {
  const Icone = iconePorCategoria[peca.categoria] ?? Smartphone

  return (
    <Card
      className={cn(
        "w-full gap-3 border border-transparent pt-0 transition-all duration-200",
        // Feedback de hover: o cartão sobe, ganha sombra e borda na cor da marca.
        "hover:-translate-y-1 hover:border-marca/30 hover:shadow-lg has-[a:focus-visible]:border-marca/40"
      )}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
        {peca.imagemUrl ? (
          <Image
            src={peca.imagemUrl}
            alt={peca.titulo}
            fill
            priority={prioridade}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 75vw"
            className="object-cover"
          />
        ) : (
          // Sem foto: mostra o ícone da categoria sobre o fundo neutro.
          <Icone className="size-10 text-primary/70" aria-hidden />
        )}
        {peca.condicao && (
          <Badge variant={varianteCondicao[peca.condicao]} className="absolute top-2 left-2 shadow-cartao">
            {peca.condicao}
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-1">
        <p className="text-xs font-semibold text-destaque">{peca.categoria}</p>
        <h3 className="line-clamp-2 font-bold leading-snug">{peca.titulo}</h3>
        {peca.modeloCelular && (
          <p className="text-xs text-muted-foreground">Compatível: {peca.modeloCelular}</p>
        )}
        <p className="mt-auto pt-1 text-xl font-extrabold">{formatarPreco(peca.preco)}</p>
      </CardContent>

      <CardFooter className="border-t-0 bg-transparent pb-4">
        <Link
          href={`/pecas/${peca.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver detalhes de ${peca.titulo} (abre em nova aba)`}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Ver detalhes
          <ExternalLink aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  )
}
