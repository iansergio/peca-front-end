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
