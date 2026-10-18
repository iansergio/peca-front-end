/** Cookie httpOnly com o JWT emitido pelo backend. */
export const COOKIE_SESSAO = "peca_sessao"

export type PayloadJwt = {
  /** Id do usuário. */
  sub: string
  nome?: string
  /** Expiração em segundos desde a epoch (RFC 7519). */
  exp: number
}

/**
 * Lê o payload do JWT emitido pelo backend, ou `null` se estiver malformado
 * ou expirado.
 *
 * NÃO valida a assinatura: o frontend não conhece o segredo do backend. Serve
 * só para a UI (nome no header, redirecionar quem não está logado). Quem
 * garante a autorização é o backend, que valida o token em toda chamada.
 *
 * Usa `atob` em vez de `Buffer` para funcionar também no Proxy.
 */
export function lerPayloadJwt(token: string): PayloadJwt | null {
  const partes = token.split(".")
  if (partes.length !== 3) return null

  let payload: Partial<PayloadJwt>
  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/")
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    payload = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }

  if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null
  if (payload.exp * 1000 <= Date.now()) return null
  return payload as PayloadJwt
}
