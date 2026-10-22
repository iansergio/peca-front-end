import Link from "next/link"
import { Suspense } from "react"
import { SearchIcon } from "lucide-react"

import { CategoriasRapidas, CategoriasRapidasEstaticas } from "@/components/layout/categorias-rapidas"
import { classeLinkHeader } from "@/components/layout/estilos"
import { Logo } from "@/components/layout/logo"
import { MenuConta, MenuContaCarregando } from "@/components/layout/menu-conta"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-marca">
        {/*
         * Mobile first: no celular a busca ocupa uma segunda linha inteira;
         * a partir de `md` logo, busca, links e CTA ficam numa única linha.
         */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 md:flex-nowrap md:gap-x-5">
          <Link
            href="/"
            aria-label="PEÇA - página inicial"
            className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <Logo />
          </Link>

          {/* O Enter envia; no celular o teclado mostra a tecla "buscar". */}
          <form role="search" action="/pecas" className="order-last w-full md:order-none md:flex-1">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                enterKeyHint="search"
                placeholder="Buscar peça, celular, modelo..."
                aria-label="Buscar peças"
                className="h-11 border-transparent bg-card pl-10 text-base md:text-sm"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
            <Link href="/pecas" className={cn(classeLinkHeader, "hidden lg:inline-flex")}>
              Explorar categorias
            </Link>
            <Suspense fallback={<MenuContaCarregando />}>
              <MenuConta />
            </Suspense>
            {/* Sem sessão, o proxy manda para /login?destino=/anunciar. */}
            <Link
              href="/anunciar"
              className={cn(
                buttonVariants(),
                "bg-card px-4 text-primary hover:bg-secondary active:bg-secondary"
              )}
            >
              Anunciar peça
            </Link>
          </div>
        </div>
      </div>

      {/* Lê `?categoria=` para destacar o atalho ativo: fica fora do shell estático. */}
      <Suspense fallback={<CategoriasRapidasEstaticas />}>
        <CategoriasRapidas />
      </Suspense>
    </header>
  )
}
