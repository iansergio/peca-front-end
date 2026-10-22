import { cacheLife } from "next/cache"
import { cookies } from "next/headers"

import type { TokenResponse } from "@/lib/api/auth"
import { COOKIE_NOME, COOKIE_SESSAO, lerPayloadJwt } from "@/lib/jwt"

export type Sessao = {
  token: string
  usuarioId: string
  nome: string
}

/** Sessão atual, ou `null` se não há cookie ou o token está malformado/expirado. */
export async function lerSessao(): Promise<Sessao | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_SESSAO)?.value
  if (!token) return null

  const payload = lerPayloadJwt(token)
  if (!payload) return null

  // O cookie de nome vence o claim do JWT: no registo o perfil é atualizado
  // depois de o token ser emitido, então o claim ainda traz o nome provisório.
  const nome = cookieStore.get(COOKIE_NOME)?.value || payload.nome || ""
  return { token, usuarioId: payload.sub, nome }
}

/**
 * Versão de `lerSessao` para a UI (header), com cache privado.
 *
 * Com Partial Prefetching, o Next pré-renderiza o App Shell lendo os cookies,
 * mas o `Date.now()` da checagem de expiração é proibido nessa fase. O
 * `"use cache: private"` resolve: o resultado fica só no navegador, por sessão.
 * Login e logout (Server Actions que mudam o cookie) invalidam esse cache.
 *
 * Devolve só o nome para o token nunca entrar em cache. As Server Actions
 * devem continuar usando `lerSessao`, que confere a expiração na hora.
 */
export async function lerUsuarioLogado(): Promise<{ nome: string } | null> {
  "use cache: private"
  // 5 min é o mínimo para o resultado entrar no App Shell. Efeito colateral:
  // o header pode mostrar a pessoa logada até 5 min depois de o token expirar.
  cacheLife({ stale: 300 })

  const sessao = await lerSessao()
  return sessao ? { nome: sessao.nome } : null
}

/**
 * Grava o token e o nome a exibir. Só pode ser chamado em Server Actions ou
 * Route Handlers. `nome` sobrescreve o nome que veio no login (ex: o que a
 * pessoa digitou no registo).
 */
export async function salvarSessao({ token, expiraEm, usuario }: TokenResponse, nome = usuario.nome) {
  const cookieStore = await cookies()
  const opcoes = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Os cookies expiram junto com o token, para não sobrar sessão inválida.
    expires: new Date(expiraEm),
  } as const
  cookieStore.set(COOKIE_SESSAO, token, opcoes)
  cookieStore.set(COOKIE_NOME, nome, opcoes)
}

export async function encerrarSessao() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_SESSAO)
  cookieStore.delete(COOKIE_NOME)
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
