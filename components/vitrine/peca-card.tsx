import { Smartphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { iconePorEtiqueta } from "@/components/vitrine/categorias"
import { formatarPreco } from "@/lib/format"
import type { Peca } from "@/lib/types"

export function PecaCard({ peca }: { peca: Peca }) {
  const Icone = iconePorEtiqueta[peca.categoria] ?? Smartphone
  const descricao = [peca.condicao, peca.detalhe].filter(Boolean).join(" • ")

  return (
    <Card className="w-full gap-3 pt-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Placeholder até as peças terem fotos vindas da API. */}
      <div className="flex aspect-[4/3] items-center justify-center bg-linear-to-br from-muted to-secondary">
        <Icone className="size-10 text-primary/70" aria-hidden />
      </div>
      <CardContent className="flex flex-1 flex-col gap-1">
        <Badge variant="secondary" className="mb-1">
          {peca.categoria}
        </Badge>
        <p className="text-lg font-bold">{formatarPreco(peca.preco)}</p>
        <h3 className="font-semibold leading-snug">{peca.titulo}</h3>
        <p className="text-xs text-muted-foreground">{descricao}</p>
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
