"use client"

import Link from "next/link"
import { useTransition } from "react"
import { LogOutIcon, UserIcon } from "lucide-react"

import { sair } from "@/app/login/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/** `nome === null` significa visitante (sem sessão válida). */
export function MenuContaCliente({ nome }: { nome: string | null }) {
  const [saindo, startTransition] = useTransition()
  const primeiroNome = nome?.split(" ")[0]

  function handleSair() {
    startTransition(() => sair())
  }

  return (
    <>
      {/*
       * Mobile: a primeira linha do header já tem logo e "Anunciar", então as
       * opções da conta ficam num menu atrás de um ícone.
       */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon" className="size-10 sm:hidden" aria-label="Minha conta" />
          }
        >
          <UserIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {nome ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="truncate">Olá, {nome}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" disabled={saindo} onClick={handleSair}>
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem render={<Link href="/login" />}>Entrar</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/registo" />}>Criar conta</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden items-center gap-2 sm:flex">
        {nome ? (
          <>
            <span className="max-w-32 truncate text-sm font-medium" title={nome}>
              Olá, {primeiroNome}
            </span>
            <Button variant="ghost" className="h-10 px-3" disabled={saindo} onClick={handleSair}>
              <LogOutIcon />
              Sair
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "h-10 px-3")}>
              Entrar
            </Link>
            <Link href="/registo" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-3")}>
              Criar conta
            </Link>
          </>
        )}
      </div>
    </>
  )
}
