import { unstable_rethrow } from "next/navigation"

import type { Peca } from "@/lib/types"

export type ResultadoPecas =
  | { ok: true; pecas: Peca[] }
  | { ok: false; erro: string }

/**
 * Busca a listagem de peças no backend.
 *
 * Nunca lança: qualquer falha (variável de ambiente ausente, backend fora do ar,
 * timeout, status HTTP de erro ou resposta fora do contrato) vira `{ ok: false }`
 * para que a página mostre uma mensagem amigável em vez de quebrar.
 */
export async function listarPecas(): Promise<ResultadoPecas> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    console.error("[listarPecas] variável de ambiente API_URL não definida")
    return { ok: false, erro: "configuracao" }
  }

  try {
    const res = await fetch(`${apiUrl}/pecas`, {
      // A vitrine deve refletir sempre o estado atual dos anúncios.
      cache: "no-store",
      // Evita que um backend travado segure a renderização indefinidamente.
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      console.error(`[listarPecas] HTTP ${res.status} em ${res.url}`)
      return { ok: false, erro: "http" }
    }

    const dados: unknown = await res.json()
    if (!Array.isArray(dados)) {
      console.error("[listarPecas] resposta não é um array", dados)
      return { ok: false, erro: "contrato" }
    }

    return { ok: true, pecas: dados as Peca[] }
  } catch (erro) {
    // Erros internos do Next (ex: fim do prerender abortando o fetch) precisam
    // subir; só tratamos aqui as falhas reais de rede/backend.
    unstable_rethrow(erro)
    console.error("[listarPecas] falha ao conectar no backend", erro)
    return { ok: false, erro: "conexao" }
  }
}
