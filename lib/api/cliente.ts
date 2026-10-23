import { ErroApi } from "@/lib/api/erros"

/** Tempo máximo de uma chamada ao backend, para um backend travado não segurar a página. */
const TIMEOUT_PADRAO_MS = 10_000

type OpcoesRequisicao = {
  metodo?: "GET" | "POST" | "PUT" | "DELETE"
  /** JWT da sessão, enviado como `Authorization: Bearer`. */
  token?: string
  /** Corpo serializado como JSON (define o Content-Type). */
  json?: unknown
  /** Corpo cru (ex: FormData); o fetch define o Content-Type com o boundary. */
  corpo?: BodyInit
  headers?: HeadersInit
  timeoutMs?: number
}

/** URL base da API (ex: `http://localhost:8080/api`), sem barra no final. */
export function urlDaApi() {
  const url = process.env.API_URL
  if (!url) {
    console.error("[api] variável de ambiente API_URL não definida")
    throw new ErroApi("O serviço não está configurado. Tente novamente mais tarde.")
  }
  return url.replace(/\/+$/, "")
}

/**
 * Faz uma chamada ao backend a partir do servidor. Centraliza a URL base, o
 * `cache: "no-store"` (os dados são sempre do usuário ou mudam a cada anúncio),
 * o timeout e o token.
 *
 * Devolve a `Response` crua: cada chamador decide o que cada status significa.
 * Lança `ErroApi` se `API_URL` faltar, e o erro do fetch em falha de rede ou timeout.
 */
export async function requisicaoApi(caminho: string, opcoes: OpcoesRequisicao = {}) {
  const headers = new Headers(opcoes.headers)
  if (opcoes.token) headers.set("Authorization", `Bearer ${opcoes.token}`)

  let corpo = opcoes.corpo
  if (opcoes.json !== undefined) {
    headers.set("Content-Type", "application/json")
    corpo = JSON.stringify(opcoes.json)
  }

  return fetch(`${urlDaApi()}${caminho}`, {
    method: opcoes.metodo ?? "GET",
    headers,
    body: corpo,
    cache: "no-store",
    signal: AbortSignal.timeout(opcoes.timeoutMs ?? TIMEOUT_PADRAO_MS),
  })
}
