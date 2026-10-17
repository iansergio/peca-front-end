import { NextResponse, type NextRequest } from "next/server"

import { COOKIE_SESSAO, lerPayloadJwt } from "@/lib/jwt"

/** Rotas que exigem login. */
const ROTAS_PROTEGIDAS = ["/anunciar"]
/** Rotas que não fazem sentido para quem já está logado. */
const ROTAS_VISITANTE = ["/login", "/registo"]

/**
 * Checagem otimista (só olha o cookie, sem chamar o backend): evita renderizar
 * /anunciar para quem não está logado. A Server Action de publicação confere a
 * sessão de novo, e o backend valida o token de verdade.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_SESSAO)?.value
  const logado = token ? lerPayloadJwt(token) !== null : false
  const { pathname } = request.nextUrl

  if (!logado && ROTAS_PROTEGIDAS.includes(pathname)) {
    const url = new URL("/login", request.url)
    url.searchParams.set("destino", pathname)
    return NextResponse.redirect(url)
  }
  if (logado && ROTAS_VISITANTE.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

export const config = {
  // Precisa ser literal (o Next lê em tempo de build): manter igual às listas acima.
  matcher: ["/anunciar", "/login", "/registo"],
}
