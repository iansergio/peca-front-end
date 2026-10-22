"use server"

import { redirect } from "next/navigation"

import { solicitarCodigo, verificarCodigo } from "@/lib/api/auth"
import { ErroApi } from "@/lib/api/erros"
import { destinoSeguro, encerrarSessao, salvarSessao } from "@/lib/sessao"

/** `ok: true` só aparece no envio do código; a confirmação redireciona no sucesso. */
export type ResultadoAuth = { ok: true } | { ok: false; erro: string }

/** Mesmas regras de `VerificarCodigoRequest` do backend. */
const CODIGO_OTP = /^\d{6}$/

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo)
  return typeof valor === "string" ? valor.trim() : ""
}

function erroDeConexao(origem: string, erro: unknown): ResultadoAuth {
  if (erro instanceof ErroApi) return { ok: false, erro: erro.message }
  console.error(`[${origem}] falha ao conectar no backend`, erro)
  return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
}

/** Etapa 1 do login (e reenvio): manda o código para o email. */
export async function enviarCodigo(formData: FormData): Promise<ResultadoAuth> {
  const email = texto(formData, "email")
  if (!email) return { ok: false, erro: "Informe o seu email." }

  try {
    await solicitarCodigo(email)
    return { ok: true }
  } catch (erro) {
    return erroDeConexao("enviarCodigo", erro)
  }
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
    return erroDeConexao("confirmarCodigo", erro)
  }

  // Fora do try: `redirect` funciona lançando uma exceção.
  redirect(destinoSeguro(formData.get("destino")))
}

export async function sair() {
  await encerrarSessao()
  redirect("/")
}
