"use client"

import { useRouter } from "next/navigation"
import { useTransition, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { salvarPerfil } from "@/app/perfil/actions"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { Usuario } from "@/lib/api/auth"

export function FormularioPerfil({ perfil }: { perfil: Usuario }) {
  const router = useRouter()
  const [salvando, startTransition] = useTransition()

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    // Chamada manual (em vez de `<form action>`) para o React não limpar os
    // campos quando salvar falhar — mesmo padrão dos outros formulários.
    evento.preventDefault()
    const formData = new FormData(evento.currentTarget)
    startTransition(async () => {
      const resultado = await salvarPerfil(formData)
      if (resultado.ok) {
        toast.success("Perfil atualizado!", { description: "Seus anúncios já mostram os dados novos." })
        return
      }
      toast.error("Não foi possível salvar o perfil", {
        description: resultado.erro,
        action: resultado.precisaLogin
          ? { label: "Entrar", onClick: () => router.push("/login?destino=/perfil") }
          : undefined,
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset disabled={salvando}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="nome">Nome</FieldLabel>
            <Input
              id="nome"
              name="nome"
              required
              maxLength={120}
              autoComplete="name"
              defaultValue={perfil.nome}
              className="h-11"
            />
          </Field>
          <Field data-disabled>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            {/* Sem `name`: o email não é enviado e não pode ser alterado aqui. */}
            <Input id="email" type="email" value={perfil.email} disabled readOnly className="h-11" />
            <FieldDescription>Para trocar o e-mail, fale com o suporte.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel-national"
              defaultValue={perfil.whatsapp ?? ""}
              // Aceita máscara; a action remove tudo o que não é dígito. O navegador
              // compila o pattern com a flag `v`, que exige escapar ( ) + - na classe.
              pattern="^[\d\s\(\)\+\-]{10,20}$"
              title="Informe o número com DDD (ex: (11) 99999-8888)"
              placeholder="(11) 99999-8888"
              className="h-11"
            />
            <FieldDescription>Os compradores falam com você por aqui.</FieldDescription>
          </Field>
        </FieldGroup>
      </fieldset>

      <Button type="submit" disabled={salvando} className="h-11 w-full text-base">
        {salvando ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Salvando...
          </>
        ) : (
          "Salvar alterações"
        )}
      </Button>
    </form>
  )
}

export function FormularioPerfilCarregando() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton className="h-11 w-full" />
    </div>
  )
}
