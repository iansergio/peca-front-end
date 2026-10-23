"use server"

import { redirect } from "next/navigation"

import { verificarCodigo } from "@/lib/api/auth"
import { pedirCodigo, resultadoDeErro, type ResultadoAuth } from "@/lib/resultado-auth"
import { destinoSeguro, encerrarSessao, salvarSessao } from "@/lib/sessao"

/** Mesmas regras de `VerificarCodigoRequest` do backend. */
const CODIGO_OTP = /^\d{6}$/

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo)
  return typeof valor === "string" ? valor.trim() : ""
}

/**
 * Etapa 1 do login (e reenvio): pede o código sem `nome`. A resposta é a
 * mesma exista a conta ou não (ver `solicitarCodigo`).
 */
export async function enviarCodigo(formData: FormData): Promise<ResultadoAuth> {
  const email = texto(formData, "email")
  if (!email) return { ok: false, erro: "Informe o seu email." }
  return pedirCodigo("enviarCodigo", email)
}

/** Etapa 2: valida o código, grava o JWT no cookie httpOnly e redireciona. */
export async function confirmarCodigo(formData: FormData): Promise<ResultadoAuth> {
  const email = texto(formData, "email")
  const codigo = texto(formData, "codigo")
  if (!email) return { ok: false, erro: "Informe o seu email." }
  if (!CODIGO_OTP.test(codigo)) return { ok: false, erro: "Digite os 6 dígitos do código." }

  try {
    await salvarSessao(await verificarCodigo(email, codigo))
  } catch (erro) {
    return resultadoDeErro("confirmarCodigo", erro)
  }

  // Fora do try: `redirect` funciona lançando uma exceção.
  redirect(destinoSeguro(formData.get("destino")))
}

export async function sair() {
  await encerrarSessao()
  redirect("/")
}
