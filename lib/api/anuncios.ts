import { unstable_rethrow } from "next/navigation"

import { requisicaoApi } from "@/lib/api/cliente"
import { ErroApi, detalheDoErro, formatarEspera, segundosDeEspera } from "@/lib/api/erros"
import type { Peca } from "@/lib/types"

export type DadosAnuncio = {
  titulo: string
  descricao: string
  preco: number
  categoria: string
  modeloCelular: string
  /** Contato do vendedor, só dígitos (10 a 13). O backend grava no perfil dele. */
  whatsapp: string
}

export type ResultadoAnuncio =
  | { ok: true; pecaId: string }
  /** A peça foi criada, mas o upload da foto falhou. */
  | { ok: "parcial"; pecaId: string; erro: string }
  /** `precisaLogin`: o backend recusou a sessão; é preciso entrar de novo. */
  | { ok: false; erro: string; precisaLogin?: true }

/** O upload passa de 5 MB: dá mais tempo que o padrão. */
const TIMEOUT_UPLOAD_MS = 30_000

/**
 * Cria um anúncio no backend em duas chamadas, ambas com o JWT da sessão:
 * 1. `POST /pecas` com os dados em JSON; o vendedor é o dono do token.
 * 2. `POST /pecas/{id}/imagem` com a foto em multipart (campo `arquivo`).
 *
 * Se a etapa 2 falhar, a peça já existe sem foto: devolvemos `ok: "parcial"`
 * em vez de erro, para o usuário saber que o anúncio foi publicado.
 */
export async function criarAnuncio(
  token: string,
  dados: DadosAnuncio,
  foto: File
): Promise<ResultadoAnuncio> {
  let pecaId: string
  try {
    const res = await requisicaoApi("/pecas", { metodo: "POST", token, json: dados })
    if (res.status === 401) {
      console.warn("[criarAnuncio] POST /pecas recusou o token (HTTP 401)")
      return { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true }
    }
    if (res.status === 403 || res.status === 404) {
      // 404: o usuário do token foi removido. Nos dois casos a sessão não serve mais.
      console.warn(`[criarAnuncio] POST /pecas HTTP ${res.status}`, await detalheDoErro(res))
      return { ok: false, erro: "Não foi possível publicar. Entre novamente.", precisaLogin: true }
    }
    if (res.status === 429) {
      const espera = formatarEspera(segundosDeEspera(res))
      console.warn(`[criarAnuncio] POST /pecas limitado (HTTP 429, ${espera})`)
      throw new ErroApi(`Muitas tentativas seguidas. Tente de novo em ${espera}.`, 429)
    }
    if (!res.ok) {
      const detalhe = await detalheDoErro(res)
      console.error(`[criarAnuncio] POST /pecas HTTP ${res.status}`, detalhe)
      throw new ErroApi(
        res.status === 400 && detalhe
          ? `Verifique os dados do anúncio (${detalhe}).`
          : "Não foi possível publicar o anúncio.",
        res.status
      )
    }
    pecaId = ((await res.json()) as Peca).id
  } catch (erro) {
    unstable_rethrow(erro)
    if (erro instanceof ErroApi) return { ok: false, erro: erro.message }
    console.error("[criarAnuncio] falha ao conectar no backend", erro)
    return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }

  // A peça já existe: daqui em diante qualquer falha (inclusive timeout) é "parcial".
  try {
    const formData = new FormData()
    formData.append("arquivo", foto)
    const resFoto = await requisicaoApi(`/pecas/${pecaId}/imagem`, {
      metodo: "POST",
      token,
      corpo: formData,
      timeoutMs: TIMEOUT_UPLOAD_MS,
    })
    if (!resFoto.ok) {
      const detalhe = await detalheDoErro(resFoto)
      console.error(`[criarAnuncio] POST /pecas/${pecaId}/imagem HTTP ${resFoto.status}`, detalhe)
      return { ok: "parcial", pecaId, erro: detalhe ?? "Falha ao enviar a foto." }
    }
    return { ok: true, pecaId }
  } catch (erro) {
    unstable_rethrow(erro)
    console.error(`[criarAnuncio] falha ao enviar a foto de ${pecaId}`, erro)
    return { ok: "parcial", pecaId, erro: "Falha ao enviar a foto." }
  }
}

export type ResultadoExclusao = { ok: true } | { ok: false; erro: string; precisaLogin?: true }

/**
 * Edita um anúncio do próprio vendedor:
 * 1. `PUT /pecas/{id}` com os dados em JSON (o backend confere se o token é do dono).
 * 2. Só se uma foto nova foi escolhida, `POST /pecas/{id}/imagem`, que substitui
 *    a anterior no Storage.
 *
 * Mesma lógica de `criarAnuncio`: se os dados forem salvos e só a foto falhar,
 * devolve `ok: "parcial"` (o anúncio já está atualizado, com a foto antiga).
 */
export async function atualizarAnuncio(
  token: string,
  pecaId: string,
  dados: DadosAnuncio,
  foto: File | null
): Promise<ResultadoAnuncio> {
  try {
    const res = await requisicaoApi(`/pecas/${pecaId}`, { metodo: "PUT", token, json: dados })
    if (res.status === 401) {
      console.warn(`[atualizarAnuncio] PUT /pecas/${pecaId} recusou o token (HTTP 401)`)
      return { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true }
    }
    // 403 aqui é "o anúncio é de outro vendedor": a sessão continua válida.
    if (res.status === 403) return { ok: false, erro: "Só quem publicou o anúncio pode editá-lo." }
    if (res.status === 404) return { ok: false, erro: "Este anúncio não existe mais." }
    if (res.status === 429) {
      const espera = formatarEspera(segundosDeEspera(res))
      return { ok: false, erro: `Muitas tentativas seguidas. Tente de novo em ${espera}.` }
    }
    if (!res.ok) {
      const detalhe = await detalheDoErro(res)
      console.error(`[atualizarAnuncio] PUT /pecas/${pecaId} HTTP ${res.status}`, detalhe)
      return {
        ok: false,
        erro:
          res.status === 400 && detalhe
            ? `Verifique os dados do anúncio (${detalhe}).`
            : "Não foi possível salvar o anúncio.",
      }
    }
  } catch (erro) {
    unstable_rethrow(erro)
    console.error("[atualizarAnuncio] falha ao conectar no backend", erro)
    return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }

  if (!foto) return { ok: true, pecaId }

  try {
    const formData = new FormData()
    formData.append("arquivo", foto)
    const resFoto = await requisicaoApi(`/pecas/${pecaId}/imagem`, {
      metodo: "POST",
      token,
      corpo: formData,
      timeoutMs: TIMEOUT_UPLOAD_MS,
    })
    if (!resFoto.ok) {
      const detalhe = await detalheDoErro(resFoto)
      console.error(`[atualizarAnuncio] POST /pecas/${pecaId}/imagem HTTP ${resFoto.status}`, detalhe)
      return { ok: "parcial", pecaId, erro: detalhe ?? "Falha ao enviar a foto nova." }
    }
    return { ok: true, pecaId }
  } catch (erro) {
    unstable_rethrow(erro)
    console.error(`[atualizarAnuncio] falha ao enviar a foto de ${pecaId}`, erro)
    return { ok: "parcial", pecaId, erro: "Falha ao enviar a foto nova." }
  }
}

/** Remove o anúncio (`DELETE /pecas/{id}`); o backend apaga também a foto do Storage. */
export async function excluirAnuncio(token: string, pecaId: string): Promise<ResultadoExclusao> {
  try {
    const res = await requisicaoApi(`/pecas/${pecaId}`, { metodo: "DELETE", token })
    // 404: já foi removido (ex: em outra aba). Para quem pediu a exclusão, deu certo.
    if (res.ok || res.status === 404) return { ok: true }
    if (res.status === 401) return { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true }
    if (res.status === 403) return { ok: false, erro: "Só quem publicou o anúncio pode excluí-lo." }
    console.error(`[excluirAnuncio] DELETE /pecas/${pecaId} HTTP ${res.status}`, await detalheDoErro(res))
    return { ok: false, erro: "Não foi possível excluir o anúncio agora." }
  } catch (erro) {
    unstable_rethrow(erro)
    console.error("[excluirAnuncio] falha ao conectar no backend", erro)
    return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }
}
