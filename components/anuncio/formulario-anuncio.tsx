"use client"

import { useRouter } from "next/navigation"
import { useTransition, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { publicarAnuncio } from "@/app/anunciar/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { categorias } from "@/components/vitrine/categorias"
import { TAMANHO_MAXIMO_FOTO, TIPOS_FOTO_ACEITOS } from "@/lib/regras-anuncio"

// O select mostra o nome da vitrine, mas envia o valor no singular esperado pela API.
const itensCategoria = categorias.map((c) => ({ value: c.valorApi, label: c.nome }))

export function FormularioAnuncio() {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    // Chamamos a Server Action manualmente (em vez de `<form action>`) para que
    // o React não limpe os campos quando a publicação falhar.
    evento.preventDefault()
    const formData = new FormData(evento.currentTarget)

    const foto = formData.get("foto")
    if (foto instanceof File && foto.size > TAMANHO_MAXIMO_FOTO) {
      const mb = (foto.size / 1024 / 1024).toFixed(1).replace(".", ",")
      toast.error("A foto deve ter no máximo 5 MB.", { description: `A foto escolhida tem ${mb} MB.` })
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
      <fieldset disabled={enviando} className="flex flex-col gap-5">
        <legend className="mb-4 text-lg font-bold">Sobre a peça</legend>

        <Campo id="titulo" label="Título">
          <Input id="titulo" name="titulo" required maxLength={120} placeholder="Ex: Tela OLED iPhone 13" className="h-10" />
        </Campo>

        <Campo id="descricao" label="Descrição" opcional>
          <Textarea
            id="descricao"
            name="descricao"
            maxLength={2000}
            rows={4}
            placeholder="Estado, garantia, detalhes de compatibilidade..."
          />
        </Campo>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="preco" label="Preço (R$)">
            <Input
              id="preco"
              name="preco"
              required
              inputMode="decimal"
              pattern="^\d+([.,]\d{1,2})?$"
              title="Use apenas números, com até 2 casas decimais (ex: 289,90)"
              placeholder="0,00"
              className="h-10"
            />
          </Campo>

          <Campo id="categoria" label="Categoria">
            <Select name="categoria" items={itensCategoria} required>
              <SelectTrigger id="categoria" className="h-10 w-full">
                <SelectValue placeholder="Escolha a categoria" />
              </SelectTrigger>
              <SelectContent>
                {itensCategoria.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
        </div>

        <Campo id="modeloCelular" label="Modelo do celular">
          <Input id="modeloCelular" name="modeloCelular" required maxLength={80} placeholder="Ex: iPhone 13" className="h-10" />
        </Campo>

        <Campo id="foto" label="Foto" dica="JPG, PNG ou WebP, até 5 MB.">
          <Input
            id="foto"
            name="foto"
            type="file"
            required
            accept={TIPOS_FOTO_ACEITOS.join(",")}
            className="h-10 py-1.5"
          />
        </Campo>
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

function Campo({
  id,
  label,
  opcional,
  dica,
  children,
}: {
  id: string
  label: string
  opcional?: boolean
  dica?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {opcional && <span className="font-normal text-muted-foreground">(opcional)</span>}
      </Label>
      {children}
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  )
}
