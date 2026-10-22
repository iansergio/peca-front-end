import { lerUsuarioLogado } from "@/lib/sessao"

import { MenuContaCliente } from "./menu-conta-cliente"

/**
 * Lê o cookie de sessão. Fica dentro de `<Suspense>` no header: com Cache
 * Components, só este trecho espera a requisição e o resto do layout segue
 * no shell estático.
 */
export async function MenuConta() {
  const usuario = await lerUsuarioLogado()
  // Só o nome vai para o cliente; o token nunca sai do servidor.
  return <MenuContaCliente nome={usuario ? usuario.nome || "Minha conta" : null} />
}

export function MenuContaCarregando() {
  return <div className="size-11 animate-pulse rounded-md bg-white/15 sm:w-32" aria-hidden />
}
