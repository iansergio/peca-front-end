import { unstable_rethrow } from "next/navigation"
import { cache } from "react"

import { requisicaoApi } from "@/lib/api/cliente"
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
  if (!process.env.API_URL) {
    console.error("[listarPecas] variável de ambiente API_URL não definida")
    return { ok: false, erro: "configuracao" }
  }

  try {
    // Timeout menor que o padrão: a vitrine prefere mostrar o aviso a ficar esperando.
    const res = await requisicaoApi("/pecas", { timeoutMs: 8000 })

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

export type ResultadoPeca =
  | { ok: true; peca: Peca }
  | { ok: false; erro: "nao-encontrada" | "http" | "conexao" | "contrato" | "configuracao" }

/** Os ids das peças são UUIDs; qualquer outra coisa nem chega ao backend. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Confere o mínimo que a página de detalhes usa, para não quebrar com uma resposta fora do contrato. */
function pareceUmaPeca(dados: unknown): dados is Peca {
  if (typeof dados !== "object" || dados === null) return false
  const p = dados as Record<string, unknown>
  return typeof p.id === "string" && typeof p.titulo === "string" && typeof p.preco === "number"
}

/**
 * Busca uma peça pelo id (`GET /pecas/{id}`, público). Mesmo padrão de
 * `listarPecas`: nunca lança, e distingue "não existe" (404 ou id inválido,
 * vira página 404) de falha do backend (vira aviso para tentar de novo).
 *
 * Envolvida em `cache` do React: a página e o `generateMetadata` pedem a mesma
 * peça na mesma requisição e só uma chamada vai ao backend.
 */
export const buscarPeca = cache(async (id: string): Promise<ResultadoPeca> => {
  if (!UUID.test(id)) return { ok: false, erro: "nao-encontrada" }
  if (!process.env.API_URL) {
    console.error("[buscarPeca] variável de ambiente API_URL não definida")
    return { ok: false, erro: "configuracao" }
  }

  try {
    const res = await requisicaoApi(`/pecas/${id}`, { timeoutMs: 8000 })
    if (res.status === 404) return { ok: false, erro: "nao-encontrada" }
    if (!res.ok) {
      console.error(`[buscarPeca] HTTP ${res.status} em ${res.url}`)
      return { ok: false, erro: "http" }
    }

    const dados: unknown = await res.json()
    if (!pareceUmaPeca(dados)) {
      console.error("[buscarPeca] resposta fora do contrato", dados)
      return { ok: false, erro: "contrato" }
    }
    return { ok: true, peca: dados }
  } catch (erro) {
    unstable_rethrow(erro)
    console.error(`[buscarPeca] falha ao conectar no backend (${id})`, erro)
    return { ok: false, erro: "conexao" }
  }
})
