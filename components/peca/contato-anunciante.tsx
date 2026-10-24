import { MessageCircle } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import type { Peca } from "@/lib/types"
import { cn } from "@/lib/utils"
import { gerarLinkWhatsapp } from "@/lib/whatsapp"

/**
 * CTA de conversão da página do anúncio: o único botão laranja da tela
 * (docs/Botões, campos e selos.png e docs/Cores.png, "acento: no máximo um por
 * tela"). Abre o WhatsApp do anunciante em nova aba com a mensagem pronta.
 *
 * A página monta duas cópias (barra fixa no celular, cartão no desktop), mas só
 * uma aparece por vez: a outra fica `hidden`, fora da árvore de acessibilidade.
 */
export function BotaoContato({ peca, className }: { peca: Peca; className?: string }) {
  const link = gerarLinkWhatsapp(peca)

  if (!link) {
    // Sem WhatsApp válido não há como falar com o anunciante; a explicação fica
    // no cartão do anunciante (`AvisoSemContato`).
    return (
      <Button type="button" disabled className={cn("h-12 text-base", className)}>
        Contato indisponível
      </Button>
    )
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o anunciante pelo WhatsApp (abre em nova aba)"
      className={cn(buttonVariants({ variant: "conversao", size: "lg" }), className)}
    >
      <MessageCircle className="size-5" aria-hidden />
      Falar com o anunciante
    </a>
  )
}

export function AvisoSemContato({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      O anunciante não informou um WhatsApp válido, então o contato está indisponível por enquanto.
    </p>
  )
}

/** Única mensagem de confiança: neutra, sem prometer garantia nem selos que não existem. */
export function DicaSeguranca({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-4 text-muted-foreground", className)}>
      Combine pagamento e entrega diretamente com o anunciante e confira a peça antes de pagar.
    </p>
  )
}
