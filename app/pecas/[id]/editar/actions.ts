"use server"

import { atualizarAnuncio, excluirAnuncio, type ResultadoAnuncio, type ResultadoExclusao } from "@/lib/api/anuncios"
import { encerrarSessao, lerSessao } from "@/lib/sessao"
import { lerFormularioAnuncio } from "@/lib/validar-anuncio"

const SESSAO_EXPIRADA = { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true } as const

export async function salvarAnuncio(pecaId: string, formData: FormData): Promise<ResultadoAnuncio> {
  // O Proxy já barra quem não está logado; o backend confere se o token é do dono.
  const sessao = await lerSessao()
  if (!sessao) return SESSAO_EXPIRADA

  const lido = lerFormularioAnuncio(formData, { fotoObrigatoria: false })
  if (!lido.ok) return lido

  const resultado = await atualizarAnuncio(sessao.token, pecaId, lido.dados, lido.foto)
  if (resultado.ok === false && resultado.precisaLogin) await encerrarSessao()
  return resultado
}

export async function removerAnuncio(pecaId: string): Promise<ResultadoExclusao> {
  const sessao = await lerSessao()
  if (!sessao) return SESSAO_EXPIRADA

  const resultado = await excluirAnuncio(sessao.token, pecaId)
  if (resultado.ok === false && resultado.precisaLogin) await encerrarSessao()
  return resultado
}
