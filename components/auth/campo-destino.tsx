"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { ComponentProps } from "react"

/**
 * Repassa `?destino=` para a Server Action, que redireciona para lá depois do
 * login. Fica isolado (e dentro de `<Suspense>` na página) porque ler a URL é
 * dado de requisição: assim o resto do formulário continua no shell estático.
 */
export function CampoDestino() {
  const destino = useSearchParams().get("destino")
  return destino ? <input type="hidden" name="destino" value={destino} /> : null
}

/** Link que preserva o `?destino=` atual (ex: do login para o registo). */
export function LinkComDestino({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const destino = useSearchParams().get("destino")
  return <Link href={destino ? `${href}?destino=${encodeURIComponent(destino)}` : href} {...props} />
}
