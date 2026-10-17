import Image from "next/image"
import { MessageCircle, Smartphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { iconePorCategoria } from "@/components/vitrine/categorias"
import { formatarPreco } from "@/lib/format"
import type { Peca } from "@/lib/types"
import { cn } from "@/lib/utils"
import { gerarLinkWhatsapp } from "@/lib/whatsapp"

export function PecaCard({ peca }: { peca: Peca }) {
  const Icone = iconePorCategoria[peca.categoria] ?? Smartphone
  const linkWhatsapp = gerarLinkWhatsapp(peca)

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
        {linkWhatsapp ? (
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Tenho interesse em ${peca.titulo} (abre o WhatsApp em nova aba)`}
            className={cn(buttonVariants(), "h-9 w-full")}
          >
            <MessageCircle aria-hidden />
            Tenho interesse
          </a>
        ) : (
          // Sem WhatsApp válido não há como contatar o vendedor.
          <Button type="button" disabled className="h-9 w-full">
            Contato indisponível
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
