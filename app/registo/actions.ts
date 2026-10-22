"use server"

import { redirect } from "next/navigation"

import { enviarCodigo, type ResultadoAuth } from "@/app/login/actions"
import { atualizarPerfil, verificarCodigo, type DadosPerfil, type TokenResponse } from "@/lib/api/auth"
import { ErroApi } from "@/lib/api/erros"
import { destinoSeguro, salvarSessao } from "@/lib/sessao"

/**
 * Lê e valida os dados do registo. Mesmas regras do `UsuarioRequest` do
 * backend, repetidas aqui porque o navegador pode ter sido contornado.
 */
function lerPerfil(formData: FormData): DadosPerfil | { erro: string } {
  const nome = String(formData.get("nome") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  // Aceita "(11) 99999-8888": a API quer só dígitos.
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "")

  if (!nome || !email) return { erro: "Informe nome e email." }
  if (nome.length > 120) return { erro: "O nome deve ter no máximo 120 caracteres." }
  if (!/^\d{10,13}$/.test(whatsapp)) return { erro: "Informe o WhatsApp com DDD (10 a 13 dígitos)." }
  return { nome, email, whatsapp }
}

/** Etapa 1 do registo: valida os dados e envia o código para o email. */
export async function iniciarRegisto(formData: FormData): Promise<ResultadoAuth> {
  const perfil = lerPerfil(formData)
  if ("erro" in perfil) return { ok: false, erro: perfil.erro }
  return enviarCodigo(formData)
}

/**
 * Etapa 2 do registo. Não existe cadastro público no backend: o
 * `solicitar-codigo` cria a conta com um nome provisório (o início do email).
 * Por isso, depois de validar o código, gravamos nome e WhatsApp com o token
 * recém-emitido em `PUT /usuarios/{id}`.
 */
export async function confirmarRegisto(formData: FormData): Promise<ResultadoAuth> {
  const perfil = lerPerfil(formData)
  if ("erro" in perfil) return { ok: false, erro: perfil.erro }
  const codigo = String(formData.get("codigo") ?? "").trim()
  if (!/^\d{6}$/.test(codigo)) return { ok: false, erro: "Digite os 6 dígitos do código." }

  let sessao: TokenResponse
  try {
    sessao = await verificarCodigo(perfil.email, codigo)
  } catch (erro) {
    if (erro instanceof ErroApi) return { ok: false, erro: erro.message }
    console.error("[confirmarRegisto] falha ao conectar no backend", erro)
    return { ok: false, erro: "Não foi possível conectar ao servidor. Tente novamente." }
  }

  // O código já foi consumido: se o PUT falhar, a pessoa entra mesmo assim
  // (com o nome provisório) em vez de ficar presa num código que não vale mais.
  let nome = sessao.usuario.nome
  try {
    nome = (await atualizarPerfil(sessao.token, sessao.usuario.id, perfil)).nome
  } catch (erro) {
    console.error("[confirmarRegisto] login feito, mas o perfil não foi salvo", erro)
  }
  await salvarSessao(sessao, nome)

  redirect(destinoSeguro(formData.get("destino")))
}
