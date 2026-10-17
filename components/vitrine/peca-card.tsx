import Image from "next/image"
import { Smartphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { iconePorCategoria } from "@/components/vitrine/categorias"
import { formatarPreco } from "@/lib/format"
import type { Peca } from "@/lib/types"

export function PecaCard({ peca }: { peca: Peca }) {
  const Icone = iconePorCategoria[peca.categoria] ?? Smartphone

  return (
    <Card className="w-full gap-3 pt-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-linear-to-br from-muted to-secondary">
        {peca.imagemUrl ? (
          <Image
            src={peca.imagemUrl}
            alt={peca.titulo}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          // Sem foto: mostra o ícone da categoria sobre o fundo neutro.
          <Icone className="size-10 text-primary/70" aria-hidden />
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1">
        <Badge variant="secondary" className="mb-1">
          {peca.categoria}
        </Badge>
        <p className="text-lg font-bold">{formatarPreco(peca.preco)}</p>
        <h3 className="font-semibold leading-snug">{peca.titulo}</h3>
        <p className="text-xs text-muted-foreground">
          {[peca.descricao, peca.modeloCelular].filter(Boolean).join(" • ")}
        </p>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent">
        {/* A ação de contato via WhatsApp será ligada em uma próxima tarefa. */}
        <Button type="button" className="h-9 w-full">
          Tenho interesse
        </Button>
      </CardFooter>
    </Card>
  )
}
