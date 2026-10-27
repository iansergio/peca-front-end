import { categorias } from "@/components/vitrine/categorias"
import type { DadosAnuncio } from "@/lib/api/anuncios"
import { WHATSAPP_VALIDO, soDigitos } from "@/lib/api/perfil"
import { TAMANHO_MAXIMO_FOTO, TIPOS_FOTO_ACEITOS } from "@/lib/regras-anuncio"

const categoriasValidas = new Set(categorias.map((c) => c.valorApi))

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo)
  return typeof valor === "string" ? valor.trim() : ""
}

export type AnuncioLido =
  | { ok: true; dados: DadosAnuncio; foto: File | null }
  | { ok: false; erro: string }

/**
 * Lê e valida o formulário de anúncio (publicar e editar). A validação é
 * repetida no servidor porque o navegador pode ter sido contornado.
 *
 * `fotoObrigatoria`: ao publicar a foto é exigida; ao editar, campo vazio
 * significa "manter a foto atual" e devolve `foto: null`.
 */
export function lerFormularioAnuncio(formData: FormData, { fotoObrigatoria }: { fotoObrigatoria: boolean }): AnuncioLido {
  const titulo = texto(formData, "titulo")
  const descricao = texto(formData, "descricao")
  const categoria = texto(formData, "categoria")
  const modeloCelular = texto(formData, "modeloCelular")
  // Aceita "(11) 99999-8888": a API quer só dígitos.
  const whatsapp = soDigitos(formData.get("whatsapp"))
  // Aceita "1.234,56" e "1234.56": remove separador de milhar e usa ponto decimal.
  const precoTexto = texto(formData, "preco")
  const preco = Number(
    precoTexto.includes(",") ? precoTexto.replace(/\./g, "").replace(",", ".") : precoTexto
  )
  const arquivo = formData.get("foto")
  // Input de arquivo vazio chega como File de 0 bytes.
  const foto = arquivo instanceof File && arquivo.size > 0 ? arquivo : null

  const erro = validar()
  if (erro) {
    console.warn(`[anuncio] formulário recusado: ${erro}`, {
      categoria,
      precoTexto,
      foto: foto ? { tipo: foto.type, bytes: foto.size } : null,
    })
    return { ok: false, erro }
  }

  function validar() {
    if (!titulo || !modeloCelular) return "Preencha título e modelo do celular."
    if (!categoriasValidas.has(categoria)) return "Escolha uma categoria."
    if (!Number.isFinite(preco) || preco < 0.01) return "Informe um preço válido."
    if (!WHATSAPP_VALIDO.test(whatsapp)) return "Informe o WhatsApp com DDD (10 a 13 dígitos)."
    if (!foto) return fotoObrigatoria ? "Escolha uma foto da peça." : null
    if (!TIPOS_FOTO_ACEITOS.includes(foto.type)) return "A foto deve ser JPG, PNG ou WebP."
    if (foto.size > TAMANHO_MAXIMO_FOTO) return "A foto deve ter no máximo 5 MB."
    return null
  }

  return {
    ok: true,
    dados: { titulo, descricao, preco: Math.round(preco * 100) / 100, categoria, modeloCelular, whatsapp },
    foto,
  }
}
