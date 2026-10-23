"use client"

import Link from "next/link"
import { useTransition } from "react"
import { LogOutIcon, UserIcon, UserRoundPenIcon } from "lucide-react"

import { sair } from "@/app/login/actions"
import { classeLinkHeader } from "@/components/layout/estilos"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            <Button
              variant="outline"
              size="icon"
              className="border-white/70 bg-transparent text-white hover:bg-white/10 aria-expanded:bg-white/10 sm:hidden"
              aria-label="Minha conta"
            />
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
              <DropdownMenuItem className="min-h-11" render={<Link href="/perfil" />}>
                <UserRoundPenIcon />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" className="min-h-11" disabled={saindo} onClick={handleSair}>
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
            <span className="max-w-32 truncate text-sm font-semibold text-white" title={nome}>
              Olá, {primeiroNome}
            </span>
            <Link href="/perfil" className={classeLinkHeader}>
              Meu perfil
            </Link>
            <Button
              variant="ghost"
              className="px-3 text-white hover:bg-white/10 hover:text-white"
              disabled={saindo}
              onClick={handleSair}
            >
              <LogOutIcon />
              Sair
            </Button>
          </>
        ) : (
          // O DS mostra só "Entrar"; quem não tem conta acha "Criar conta" no login.
          <Link href="/login" className={classeLinkHeader}>
            Entrar
          </Link>
        )}
      </div>
    </>
  )
}
