"use server"

import { categorias } from "@/components/vitrine/categorias"
import { criarAnuncio, type ResultadoAnuncio } from "@/lib/api/anuncios"
import { TAMANHO_MAXIMO_FOTO, TIPOS_FOTO_ACEITOS } from "@/lib/regras-anuncio"

const categoriasValidas = new Set(categorias.map((c) => c.valorApi))

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo)
  return typeof valor === "string" ? valor.trim() : ""
}

export async function publicarAnuncio(formData: FormData): Promise<ResultadoAnuncio> {
  const email = texto(formData, "email")
  const senha = typeof formData.get("senha") === "string" ? (formData.get("senha") as string) : ""
  const titulo = texto(formData, "titulo")
  const descricao = texto(formData, "descricao")
  const categoria = texto(formData, "categoria")
  const modeloCelular = texto(formData, "modeloCelular")
  // Aceita "1.234,56" e "1234.56": remove separador de milhar e usa ponto decimal.
  const precoTexto = texto(formData, "preco")
  const preco = Number(
    precoTexto.includes(",") ? precoTexto.replace(/\./g, "").replace(",", ".") : precoTexto
  )
  const foto = formData.get("foto")

  // Validação repetida no servidor: o navegador pode ter sido contornado.
  if (!email || !senha) return { ok: false, erro: "Informe email e senha." }
  if (!titulo || !modeloCelular) return { ok: false, erro: "Preencha título e modelo do celular." }
  if (!categoriasValidas.has(categoria)) return { ok: false, erro: "Escolha uma categoria." }
  if (!Number.isFinite(preco) || preco < 0.01) return { ok: false, erro: "Informe um preço válido." }
  if (!(foto instanceof File) || foto.size === 0) return { ok: false, erro: "Escolha uma foto da peça." }
  if (!TIPOS_FOTO_ACEITOS.includes(foto.type)) {
    return { ok: false, erro: "A foto deve ser JPG, PNG ou WebP." }
  }
  if (foto.size > TAMANHO_MAXIMO_FOTO) return { ok: false, erro: "A foto deve ter no máximo 5 MB." }

  return criarAnuncio(
    { email, senha },
    { titulo, descricao, preco: Math.round(preco * 100) / 100, categoria, modeloCelular },
    foto
  )
}
