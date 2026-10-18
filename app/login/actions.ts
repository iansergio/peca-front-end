"use server"

import { redirect } from "next/navigation"

import { login } from "@/lib/api/auth"
import { ErroApi } from "@/lib/api/erros"
import { destinoSeguro, encerrarSessao, salvarSessao } from "@/lib/sessao"

export type ResultadoAuth = { erro: string }

/** Em caso de sucesso redireciona (e não retorna); em caso de falha devolve o erro. */
export async function entrar(formData: FormData): Promise<ResultadoAuth> {
  const email = String(formData.get("email") ?? "").trim()
  const senha = String(formData.get("senha") ?? "")
  if (!email || !senha) return { erro: "Informe email e senha." }

  try {
    await salvarSessao(await login(email, senha))
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message }
    console.error("[entrar] falha ao conectar no backend", erro)
    return { erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }

  // Fora do try: `redirect` funciona lançando uma exceção.
  redirect(destinoSeguro(formData.get("destino")))
}

export async function sair() {
  await encerrarSessao()
  redirect("/")
}
