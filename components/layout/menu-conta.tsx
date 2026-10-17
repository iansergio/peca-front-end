import { lerSessao } from "@/lib/sessao"

import { MenuContaCliente } from "./menu-conta-cliente"

/**
 * Lê o cookie de sessão. Fica dentro de `<Suspense>` no header: com Cache
 * Components, só este trecho espera a requisição e o resto do layout segue
 * no shell estático.
 */
export async function MenuConta() {
  const sessao = await lerSessao()
  // Só o nome vai para o cliente; o token nunca sai do servidor.
  return <MenuContaCliente nome={sessao ? sessao.nome || "Minha conta" : null} />
}

export function MenuContaCarregando() {
  return <div className="h-10 w-10 animate-pulse rounded-lg bg-muted sm:w-40" aria-hidden />
}
