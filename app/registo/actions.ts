"use server"

import { redirect } from "next/navigation"

import type { ResultadoAuth } from "@/app/login/actions"
import { cadastrar, login } from "@/lib/api/auth"
import { ErroApi } from "@/lib/api/erros"
import { destinoSeguro, salvarSessao } from "@/lib/sessao"

export async function registar(formData: FormData): Promise<ResultadoAuth> {
  const nome = String(formData.get("nome") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const senha = String(formData.get("senha") ?? "")
  // Aceita "(11) 99999-8888": a API quer só dígitos.
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "")

  // Mesmas regras do `UsuarioRequest` do backend, repetidas aqui porque o
  // navegador pode ter sido contornado.
  if (!nome || !email) return { erro: "Informe nome e email." }
  if (senha.length < 8 || senha.length > 72) return { erro: "A senha deve ter entre 8 e 72 caracteres." }
  if (whatsapp && !/^\d{10,13}$/.test(whatsapp)) {
    return { erro: "Informe o WhatsApp com DDD (10 a 13 dígitos)." }
  }

  try {
    await cadastrar({ nome, email, senha, whatsapp: whatsapp || undefined })
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message }
    console.error("[registar] falha ao conectar no backend", erro)
    return { erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }

  // A conta já existe neste ponto: se o login automático falhar, mandamos a
  // pessoa para o login em vez de mostrar erro (tentar de novo daria 409).
  try {
    await salvarSessao(await login(email, senha))
  } catch (erro) {
    console.error("[registar] conta criada, mas o login automático falhou", erro)
    redirect(`/login?destino=${encodeURIComponent(destinoSeguro(formData.get("destino")))}`)
  }

  redirect(destinoSeguro(formData.get("destino")))
}
