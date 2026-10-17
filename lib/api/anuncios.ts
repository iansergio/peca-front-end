import { unstable_rethrow } from "next/navigation"

import { ErroApi, detalheDoErro } from "@/lib/api/erros"
import type { Peca } from "@/lib/types"

export type DadosAnuncio = {
  titulo: string
  descricao: string
  preco: number
  categoria: string
  modeloCelular: string
}

export type ResultadoAnuncio =
  | { ok: true; pecaId: string }
  /** A peça foi criada, mas o upload da foto falhou. */
  | { ok: "parcial"; pecaId: string; erro: string }
  /** `precisaLogin`: o token foi recusado pelo backend; é preciso entrar de novo. */
  | { ok: false; erro: string; precisaLogin?: true }

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
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    console.error("[criarAnuncio] variável de ambiente API_URL não definida")
    return { ok: false, erro: "O serviço de anúncios não está configurado." }
  }

  let pecaId: string
  try {
    const res = await fetch(`${apiUrl}/pecas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    })
    if (res.status === 401) {
      console.warn("[criarAnuncio] POST /pecas recusou o token (HTTP 401)")
      return { ok: false, erro: "Sua sessão expirou. Entre novamente.", precisaLogin: true }
    }
    if (!res.ok) {
      const detalhe = await detalheDoErro(res)
      console.error(`[criarAnuncio] POST /pecas HTTP ${res.status}`, detalhe)
      throw new ErroApi(
        res.status === 400 && detalhe
          ? `Verifique os dados do anúncio (${detalhe}).`
          : "Não foi possível publicar o anúncio."
      )
    }
    pecaId = ((await res.json()) as Peca).id

    const formData = new FormData()
    formData.append("arquivo", foto)
    const resFoto = await fetch(`${apiUrl}/pecas/${pecaId}/imagem`, {
      method: "POST",
      // Sem Content-Type manual: o fetch define o boundary do multipart.
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    })
    if (!resFoto.ok) {
      const detalhe = await detalheDoErro(resFoto)
      console.error(`[criarAnuncio] POST /pecas/${pecaId}/imagem HTTP ${resFoto.status}`, detalhe)
      return { ok: "parcial", pecaId, erro: detalhe ?? "Falha ao enviar a foto." }
    }

    return { ok: true, pecaId }
  } catch (erro) {
    unstable_rethrow(erro)
    if (erro instanceof ErroApi) return { ok: false, erro: erro.message }
    console.error("[criarAnuncio] falha ao conectar no backend", erro)
    return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }
}
