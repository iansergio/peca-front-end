import { cookies } from "next/headers"

import type { TokenResponse } from "@/lib/api/auth"
import { COOKIE_SESSAO, lerPayloadJwt } from "@/lib/jwt"

export type Sessao = {
  token: string
  usuarioId: string
  nome: string
}

/** Sessão atual, ou `null` se não há cookie ou o token está malformado/expirado. */
export async function lerSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value
  if (!token) return null

  const payload = lerPayloadJwt(token)
  if (!payload) return null

  return { token, usuarioId: payload.sub, nome: payload.nome ?? "" }
}

/** Grava o token. Só pode ser chamado em Server Actions ou Route Handlers. */
export async function salvarSessao({ token, expiraEm }: TokenResponse) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // O cookie expira junto com o token, para não sobrar sessão inválida.
    expires: new Date(expiraEm),
  })
}

export async function encerrarSessao() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_SESSAO)
}

/**
 * Aceita só caminhos internos (`/anunciar`), para que `?destino=` não vire um
 * redirecionamento aberto para outro site (`//evil.com`, `https://...`).
 */
export function destinoSeguro(valor: FormDataEntryValue | null) {
  if (typeof valor !== "string" || !valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) {
    return "/"
  }
  return valor
}
