import Link from "next/link"
import { Suspense } from "react"
import { SearchIcon } from "lucide-react"

import { MenuConta, MenuContaCarregando } from "@/components/layout/menu-conta"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/*
       * Mobile first: no celular a busca ocupa uma segunda linha inteira;
       * a partir de `md` logo, busca e CTA ficam alinhados em uma única linha.
       */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-primary"
          aria-label="PEÇA - página inicial"
        >
          PEÇA
        </Link>

        {/* Busca mockada: ainda não há endpoint de busca na API. */}
        <form
          role="search"
          action="/"
          className="order-last flex w-full gap-2 md:order-none md:flex-1"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Busque peça, celular, modelo..."
              aria-label="Buscar peças"
              className="h-10 bg-background pl-8"
            />
          </div>
          <Button type="submit" className="h-10 px-4">
            Buscar
          </Button>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Suspense fallback={<MenuContaCarregando />}>
            <MenuConta />
          </Suspense>
          <Link href="/anunciar" className={cn(buttonVariants(), "h-10 px-4")}>
            Anunciar peça
          </Link>
        </div>
      </div>
    </header>
  )
}
