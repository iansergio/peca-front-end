"use client"

import { useRouter } from "next/navigation"
import { useTransition, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { publicarAnuncio } from "@/app/anunciar/actions"
import { CamposAnuncio, conferirTamanhoFoto } from "@/components/anuncio/campos-anuncio"
import { Button } from "@/components/ui/button"

export function FormularioAnuncio({ whatsappInicial }: { whatsappInicial: string }) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    // Chamamos a Server Action manualmente (em vez de `<form action>`) para que
    // o React não limpe os campos quando a publicação falhar.
    evento.preventDefault()
    const formData = new FormData(evento.currentTarget)

    const fotoGrande = conferirTamanhoFoto(formData)
    if (fotoGrande) {
      toast.error("A foto deve ter no máximo 5 MB.", { description: fotoGrande })
      return
    }

    startTransition(async () => {
      const resultado = await publicarAnuncio(formData)

      if (resultado.ok === false) {
        toast.error("Não foi possível publicar o anúncio", {
          description: resultado.erro,
          // Os campos continuam preenchidos; a pessoa decide quando ir ao login.
          action: resultado.precisaLogin
            ? { label: "Entrar", onClick: () => router.push("/login?destino=/anunciar") }
            : undefined,
        })
        return
      }

      if (resultado.ok === "parcial") {
        toast.warning("Anúncio publicado sem foto", { description: resultado.erro })
      } else {
        toast.success("Anúncio publicado!", { description: "Sua peça já está na vitrine." })
      }
      router.push("/")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset disabled={enviando} className="flex flex-col gap-6">
        <CamposAnuncio whatsappInicial={whatsappInicial} />
      </fieldset>

      <Button type="submit" disabled={enviando} className="h-11 w-full text-base sm:w-auto sm:self-end sm:px-8">
        {enviando ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Publicando...
          </>
        ) : (
          "Publicar anúncio"
        )}
      </Button>
    </form>
  )
}
