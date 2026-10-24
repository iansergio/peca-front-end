import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, MessageCircle, Smartphone } from "lucide-react"

import { AvisoSemContato, BotaoContato, DicaSeguranca } from "@/components/peca/contato-anunciante"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { iconePorCategoria } from "@/components/vitrine/categorias"
import { formatarPreco } from "@/lib/format"
import type { Condicao, Peca } from "@/lib/types"
import { formatarWhatsapp, normalizarWhatsapp } from "@/lib/whatsapp"

/** Mesmas cores dos selos do cartão da vitrine (docs/Botões, campos e selos.png). */
const varianteCondicao = {
  Nova: "default",
  Original: "acento",
  Retirada: "destaque",
  Usada: "outline",
} as const satisfies Record<Condicao, string>

/**
 * Página de detalhes da peça.
 *
 * - Celular (< lg): reproduz docs/Celular anúncio.png. A foto ocupa a largura
 *   toda e o contato fica numa barra fixa no rodapé com o preço. A barra
 *   "Detalhe da peça" e o recuo das bordas ficam em `PaginaDetalhe`.
 * - Desktop (lg): duas colunas com os mesmos cartões; o contato vai para o
 *   cartão "Fale com o anunciante" e a barra fixa some.
 *
 * Só mostra dados que a API devolve: sem frete, localização, data do anúncio,
 * técnico verificado nem galeria (ver lacunas no ROADMAP).
 */
export function DetalhePeca({ peca }: { peca: Peca }) {
  const Icone = iconePorCategoria[peca.categoria] ?? Smartphone
  const preco = formatarPreco(peca.preco)
  const descricao = peca.descricao?.trim()

  return (
    <article>
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        {/* Foto 4:3 inteira (object-contain) sobre fundo neutro, sem faixas pretas. */}
        <div className="relative flex aspect-[4/3] items-center justify-center border-b bg-card lg:overflow-hidden lg:rounded-xl lg:border-0 lg:bg-muted lg:shadow-cartao">
          {peca.imagemUrl ? (
            <Image
              src={peca.imagemUrl}
              alt={peca.titulo}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
            />
          ) : (
            <Icone className="size-16 text-primary/70" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-3 px-4 pt-3 lg:gap-4 lg:px-0 lg:pt-0">
          <Card className="gap-2 px-4 lg:px-6 lg:py-6">
            <div className="flex flex-wrap items-center gap-2">
              {peca.condicao && <Badge variant={varianteCondicao[peca.condicao]}>{peca.condicao}</Badge>}
              <span className="text-xs leading-4 font-semibold text-destaque">{peca.categoria}</span>
            </div>
            <h1 className="font-heading text-2xl leading-8 font-bold tracking-tight text-balance lg:text-[2rem] lg:leading-10">
              {peca.titulo}
            </h1>
            <p className="font-heading text-[1.75rem] leading-9 font-semibold lg:text-4xl lg:leading-[2.75rem]">
              {preco}
            </p>
          </Card>

          {(peca.modeloCelular || descricao) && (
            <Card className="gap-3 px-4 lg:px-6">
              <h2 className="font-heading text-lg leading-6 font-bold">
                {peca.modeloCelular ? "Compatível com" : "Descrição"}
              </h2>
              {peca.modeloCelular && (
                <ul className="flex flex-wrap gap-2" aria-label="Modelos compatíveis">
                  <li className="inline-flex h-9 items-center rounded-full border bg-card px-4 text-[0.9375rem] font-semibold">
                    {peca.modeloCelular}
                  </li>
                </ul>
              )}
              {descricao && (
                // Texto puro: quebras de linha preservadas, nada de HTML.
                <p className="text-[0.9375rem] leading-[1.375rem] whitespace-pre-line text-foreground">
                  {descricao}
                </p>
              )}
            </Card>
          )}

          <CartaoAnunciante peca={peca} />
        </div>
      </div>

      <BarraContato peca={peca} preco={preco} />
    </article>
  )
}

/**
 * Moldura da rota (fora do Suspense, entra no shell estático): no celular a
 * barra "Detalhe da peça" substitui o header do site (regra em globals.css,
 * pelo atributo `data-detalhe-peca`) e o conteúdo encosta nas bordas.
 */
export function PaginaDetalhe({ children }: { children: React.ReactNode }) {
  return (
    <div data-detalhe-peca className="-mx-4 -mt-6 md:-mt-10 lg:mx-0 lg:mt-0">
      <BarraTitulo />
      {children}
    </div>
  )
}

/** Barra de título do celular. A aba é nova e não tem histórico: a seta leva a /pecas. */
function BarraTitulo() {
  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-1 bg-marca px-2 text-white lg:hidden">
      <Link
        href="/pecas"
        aria-label="Voltar para as peças"
        className="inline-flex size-11 items-center justify-center rounded-md outline-none transition-colors hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/60 active:bg-marca-profundo"
      >
        <ChevronLeft className="size-6" aria-hidden />
      </Link>
      <p className="font-heading text-lg font-bold">Detalhe da peça</p>
    </div>
  )
}

function CartaoAnunciante({ peca }: { peca: Peca }) {
  const nome = peca.vendedor?.nome?.trim() || "Anunciante"
  const temContato = normalizarWhatsapp(peca.vendedor?.whatsapp) !== null
  const numero = temContato ? formatarWhatsapp(peca.vendedor?.whatsapp) : null

  return (
    <Card className="gap-4 px-4 lg:px-6 lg:py-6" aria-labelledby="anunciante-titulo">
      {/* No celular o cartão não tem título visível (prancha); no desktop vira "Fale com o anunciante". */}
      <h2
        id="anunciante-titulo"
        className="sr-only font-heading text-lg leading-6 font-bold lg:not-sr-only lg:flex lg:items-center lg:gap-2"
      >
        <MessageCircle className="hidden size-5 text-destaque lg:block" aria-hidden />
        Fale com o anunciante
      </h2>

      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-lg font-bold text-muted-foreground"
        >
          {iniciais(nome)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{nome}</p>
          {numero && (
            <p className="text-sm text-muted-foreground">
              <span className="sr-only">WhatsApp: </span>
              {numero}
            </p>
          )}
        </div>
      </div>

      {!temContato && <AvisoSemContato />}

      {/* Desktop: o CTA mora aqui. No celular ele fica na barra fixa. */}
      <div className="hidden flex-col gap-3 lg:flex">
        <BotaoContato peca={peca} className="w-full" />
      </div>
      <Separator className="lg:hidden" />
      <DicaSeguranca />
    </Card>
  )
}

/** Barra fixa do celular (prancha): preço à esquerda, CTA laranja à direita. */
function BarraContato({ peca, preco }: { peca: Peca; preco: string }) {
  return (
    <div
      data-barra-contato
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <div className="shrink-0">
          <p className="text-xs leading-4 text-muted-foreground">Preço</p>
          <p className="font-heading text-xl leading-7 font-semibold">{preco}</p>
        </div>
        <BotaoContato peca={peca} className="min-w-0 flex-1" />
      </div>
    </div>
  )
}

/** "Ian Sergio Helfenberger" vira "IH": primeira e última iniciais. */
function iniciais(nome: string) {
  const partes = nome.split(/\s+/).filter(Boolean)
  const primeira = partes[0]?.[0] ?? "?"
  const ultima = partes.length > 1 ? partes.at(-1)![0] : ""
  return (primeira + ultima).toUpperCase()
}
