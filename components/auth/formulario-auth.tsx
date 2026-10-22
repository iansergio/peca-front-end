"use client"

import { Suspense, useState, useTransition, type FormEvent, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

import type { ResultadoAuth } from "@/app/login/actions"
import { CampoDestino } from "@/components/auth/campo-destino"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"

/**
 * Casca comum das etapas de login e registo: envia para a Server Action e
 * mostra o erro devolvido. Na confirmação do código a action redireciona; no
 * envio do código ela devolve `ok: true` e o `aoConcluir` avança de etapa.
 */
export function FormularioAuth({
  acao,
  aoConcluir,
  aoFalhar,
  rotuloEnviar,
  rotuloEnviando,
  children,
}: {
  acao: (formData: FormData) => Promise<ResultadoAuth>
  aoConcluir?: (formData: FormData) => void
  aoFalhar?: () => void
  rotuloEnviar: string
  rotuloEnviando: string
  children: ReactNode
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, startTransition] = useTransition()

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    // Chamada manual (em vez de `<form action>`) para o React não limpar os
    // campos quando o login falhar — mesmo padrão do formulário de anúncio.
    evento.preventDefault()
    const formData = new FormData(evento.currentTarget)
    setErro(null)
    startTransition(async () => {
      const resultado = await acao(formData)
      // Sem resultado = a action redirecionou.
      if (!resultado) return
      if (resultado.ok) aoConcluir?.(formData)
      else {
        setErro(resultado.erro)
        aoFalhar?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Suspense>
        <CampoDestino />
      </Suspense>
      <fieldset disabled={enviando}>
        <FieldGroup>{children}</FieldGroup>
      </fieldset>

      {erro && (
        <FieldError className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          {erro}
        </FieldError>
      )}

      <Button type="submit" disabled={enviando} className="h-11 w-full text-base">
        {enviando ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {rotuloEnviando}
          </>
        ) : (
          rotuloEnviar
        )}
      </Button>
    </form>
  )
}
