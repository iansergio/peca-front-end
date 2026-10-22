import Link from "next/link"
import { BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const selosConfianca = [
  { icone: ShieldCheck, texto: "100% Seguro" },
  { icone: MessageCircle, texto: "Negociação direta via WhatsApp" },
  { icone: BadgeCheck, texto: "Peças testadas" },
]

export function HeroSection() {
  return (
    // Degradê só com tons da paleta (marca-profundo -> marca -> destaque): o DS proíbe azul royal.
    <section className="relative overflow-hidden rounded-xl bg-linear-to-br from-marca-profundo via-marca to-destaque px-5 py-8 text-white md:px-10 md:py-14">
      {/* Engrenagem decorativa, eco do logo; não interfere na leitura. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -bottom-20 size-72 rounded-full border-[28px] border-dashed border-white/10 md:size-96"
      />

      <div className="relative max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-balance md:text-5xl">
          Encontre a peça certa.
          <br />
          Venda o que está parado.
        </h1>
        <p className="mt-3 text-white/85 md:text-lg">
          O técnico anuncia, você encontra pelo modelo e fecha a negociação direto no WhatsApp.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {/* CTA primário da tela: branco sobre a marca, maior contraste do bloco. */}
          <Link
            href="/pecas"
            className={cn(buttonVariants({ size: "lg" }), "bg-card text-primary hover:bg-secondary active:bg-secondary")}
          >
            Explorar peças
          </Link>
          <Link
            href="#procurando"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/80 bg-transparent text-white hover:bg-white/10"
            )}
          >
            Estou procurando
          </Link>
        </div>

        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Por que comprar no PEÇA">
          {selosConfianca.map(({ icone: Icone, texto }) => (
            <li
              key={texto}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20"
            >
              <Icone className="size-4" aria-hidden />
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
