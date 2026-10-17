"use server"

import { categorias } from "@/components/vitrine/categorias"
import { criarAnuncio, type ResultadoAnuncio } from "@/lib/api/anuncios"
import { TAMANHO_MAXIMO_FOTO, TIPOS_FOTO_ACEITOS } from "@/lib/regras-anuncio"
import { encerrarSessao, lerSessao } from "@/lib/sessao"

const categoriasValidas = new Set(categorias.map((c) => c.valorApi))

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo)
  return typeof valor === "string" ? valor.trim() : ""
}

export async function publicarAnuncio(formData: FormData): Promise<ResultadoAnuncio> {
  // O Proxy já barra quem não está logado, mas a action pode ser chamada
  // direto (ou o token pode ter expirado com o formulário aberto).
  const sessao = await lerSessao()
  if (!sessao) return { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true }

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
  const erro = validar()
  if (erro) {
    console.warn(`[publicarAnuncio] recusado: ${erro}`, {
      categoria,
      precoTexto,
      foto: foto instanceof File ? { tipo: foto.type, bytes: foto.size } : null,
    })
    return { ok: false, erro }
  }

  function validar() {
    if (!titulo || !modeloCelular) return "Preencha título e modelo do celular."
    if (!categoriasValidas.has(categoria)) return "Escolha uma categoria."
    if (!Number.isFinite(preco) || preco < 0.01) return "Informe um preço válido."
    if (!(foto instanceof File) || foto.size === 0) return "Escolha uma foto da peça."
    if (!TIPOS_FOTO_ACEITOS.includes(foto.type)) return "A foto deve ser JPG, PNG ou WebP."
    if (foto.size > TAMANHO_MAXIMO_FOTO) return "A foto deve ter no máximo 5 MB."
    return null
  }

  const resultado = await criarAnuncio(
    sessao.token,
    { titulo, descricao, preco: Math.round(preco * 100) / 100, categoria, modeloCelular },
    foto as File
  )
  // Token recusado pelo backend: apaga o cookie para o header não mostrar
  // uma sessão que já não vale.
  if (resultado.ok === false && resultado.precisaLogin) await encerrarSessao()
  return resultado
}
