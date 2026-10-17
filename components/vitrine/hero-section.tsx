import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="rounded-2xl border bg-linear-to-br from-secondary to-card p-6 md:p-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-balance md:text-5xl">
        Encontre a peça certa.
        <br />
        Venda o que está parado.
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Um marketplace simples e direto para quem compra, vende ou procura peças
        e celulares.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="#destaques" className={cn(buttonVariants(), "h-10 px-4")}>
          Explorar peças
        </Link>
        <Link
          href="#procurando"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 px-4 text-primary"
          )}
        >
          Estou procurando
        </Link>
      </div>
    </section>
  )
}
