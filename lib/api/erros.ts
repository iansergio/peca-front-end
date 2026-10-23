/**
 * Erro de uma chamada à API, já com mensagem pronta para o usuário.
 * `status` é o HTTP devolvido pelo backend, quando houve resposta.
 */
export class ErroApi extends Error {
  constructor(
    mensagem: string,
    readonly status?: number
  ) {
    super(mensagem)
  }
}

/** HTTP 429: limite de pedidos do backend. `segundos` vem do header Retry-After. */
export class ErroLimite extends ErroApi {
  constructor(
    mensagem: string,
    readonly segundos: number
  ) {
    super(mensagem, 429)
  }
}

/** Usado quando o backend responde 429 sem Retry-After (ou com valor inválido). */
const ESPERA_PADRAO_S = 60

/**
 * Lê o Retry-After em segundos. O backend manda um número inteiro, mas o HTTP
 * também permite uma data; os dois formatos são aceitos.
 */
export function segundosDeEspera(res: Response) {
  const valor = res.headers.get("Retry-After")?.trim()
  if (!valor) return ESPERA_PADRAO_S
  if (/^\d+$/.test(valor)) return Math.max(1, Number(valor))
  const data = Date.parse(valor)
  return Number.isNaN(data) ? ESPERA_PADRAO_S : Math.max(1, Math.ceil((data - Date.now()) / 1000))
}

/** "45 segundos", "1 minuto", "3 minutos" (arredonda os minutos para cima). */
export function formatarEspera(segundos: number) {
  if (segundos < 60) return segundos === 1 ? "1 segundo" : `${segundos} segundos`
  const minutos = Math.ceil(segundos / 60)
  return minutos === 1 ? "1 minuto" : `${minutos} minutos`
}

/** Lê o `detail` do ProblemDetail do Spring, se houver. */
export async function detalheDoErro(res: Response) {
  try {
    const corpo = await res.json()
    return typeof corpo?.detail === "string" ? corpo.detail : null
  } catch {
    return null
  }
}
