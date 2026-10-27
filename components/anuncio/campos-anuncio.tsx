"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ImageIcon } from "lucide-react"

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
import type { Peca } from "@/lib/types"

// O select mostra o nome da vitrine, mas envia o valor no singular esperado pela API.
const itensCategoria = categorias.map((c) => ({ value: c.valorApi, label: c.nome }))

/** "450" vira "450,00": o campo de preço usa vírgula, como a pessoa digitaria. */
function precoParaCampo(preco: number) {
  return preco.toFixed(2).replace(".", ",")
}

/**
 * Bloqueia o envio de uma foto acima do limite antes de subir 5+ MB para a
 * Server Action. Devolve a mensagem de erro, ou `null` se está tudo certo.
 */
export function conferirTamanhoFoto(formData: FormData) {
  const foto = formData.get("foto")
  if (foto instanceof File && foto.size > TAMANHO_MAXIMO_FOTO) {
    const mb = (foto.size / 1024 / 1024).toFixed(1).replace(".", ",")
    return `A foto escolhida tem ${mb} MB.`
  }
  return null
}

/**
 * Campos do anúncio, usados em /anunciar e em /pecas/[id]/editar.
 *
 * Com `peca`, os campos começam preenchidos e a foto vira opcional: a atual
 * aparece como prévia e só é trocada se a pessoa escolher outra.
 */
export function CamposAnuncio({ peca, whatsappInicial }: { peca?: Peca; whatsappInicial: string }) {
  const editando = Boolean(peca)

  return (
    <>
      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 font-heading text-lg font-bold">Sobre a peça</legend>

        <Campo id="titulo" label="Título">
          <Input
            id="titulo"
            name="titulo"
            required
            maxLength={120}
            defaultValue={peca?.titulo}
            placeholder="Ex: Tela OLED iPhone 13"
            className="h-11"
          />
        </Campo>

        <Campo id="descricao" label="Descrição" opcional>
          <Textarea
            id="descricao"
            name="descricao"
            maxLength={2000}
            rows={4}
            defaultValue={peca?.descricao ?? undefined}
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
              defaultValue={peca ? precoParaCampo(peca.preco) : undefined}
              placeholder="0,00"
              className="h-11"
            />
          </Campo>

          <Campo id="categoria" label="Categoria">
            <Select name="categoria" items={itensCategoria} defaultValue={peca?.categoria} required>
              <SelectTrigger id="categoria" className="h-11 w-full">
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
          <Input
            id="modeloCelular"
            name="modeloCelular"
            required
            maxLength={80}
            defaultValue={peca?.modeloCelular}
            placeholder="Ex: iPhone 13"
            className="h-11"
          />
        </Campo>

        <Campo
          id="whatsapp"
          label="WhatsApp para contato"
          dica="Compradores falam com você por aqui. Este número fica salvo no seu perfil."
        >
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel-national"
            defaultValue={whatsappInicial}
            // Aceita máscara; a action remove tudo o que não é dígito. O navegador
            // compila o pattern com a flag `v`, que exige escapar ( ) + - na classe.
            pattern="^[\d\s\(\)\+\-]{10,20}$"
            title="Informe o número com DDD (ex: (11) 99999-8888)"
            placeholder="(11) 99999-8888"
            className="h-11"
          />
        </Campo>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 font-heading text-lg font-bold">Foto</legend>
        <CampoFoto imagemAtual={peca?.imagemUrl ?? null} titulo={peca?.titulo ?? ""} obrigatoria={!editando} />
      </fieldset>
    </>
  )
}

/**
 * Input de foto com prévia. Mostra a foto escolhida (ou a atual, ao editar),
 * para a pessoa conferir antes de salvar.
 */
function CampoFoto({
  imagemAtual,
  titulo,
  obrigatoria,
}: {
  imagemAtual: string | null
  titulo: string
  obrigatoria: boolean
}) {
  const [previa, setPrevia] = useState<string | null>(null)

  // Libera a URL temporária da prévia quando ela muda ou o campo sai da tela.
  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa)
    }
  }, [previa])

  const exibida = previa ?? imagemAtual

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted sm:w-40">
        {exibida ? (
          // Prévia local (blob:) não passa pelo otimizador do next/image.
          <Image src={exibida} alt={titulo ? `Foto de ${titulo}` : "Prévia da foto"} fill unoptimized={Boolean(previa)} sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
        ) : (
          <ImageIcon className="size-8 text-tinta-placeholder" aria-hidden />
        )}
      </div>
      <Campo
        id="foto"
        label={imagemAtual ? "Trocar foto" : "Foto da peça"}
        opcional={!obrigatoria}
        dica={
          imagemAtual
            ? "Deixe em branco para manter a foto atual. JPG, PNG ou WebP, até 5 MB."
            : "JPG, PNG ou WebP, até 5 MB."
        }
      >
        <Input
          id="foto"
          name="foto"
          type="file"
          required={obrigatoria}
          accept={TIPOS_FOTO_ACEITOS.join(",")}
          onChange={(evento) => {
            const arquivo = evento.currentTarget.files?.[0]
            setPrevia(arquivo ? URL.createObjectURL(arquivo) : null)
          }}
          className="h-11 cursor-pointer py-2"
        />
      </Campo>
    </div>
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
    <div className="flex flex-1 flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {opcional && <span className="font-normal text-muted-foreground">(opcional)</span>}
      </Label>
      {children}
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  )
}
